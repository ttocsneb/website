<template>
<div class="my-4">
    <form class="d-flex flex-col" v-if="makingComment" @submit.prevent="makeComment">
        <textarea class="cmt-comment my-3" v-model="form.comment" name="comment" placeholder="Comment"></textarea>
        <div class="row">
            <button class="btn-warning cmt-cancel ms-auto mt-4 col-sm-2" type="reset" @click="onCancel">Cancel</button>
            <button class="btn-primary ms-sm-4 mt-4 col-sm-2" type="submit" :disabled="form.comment.length == 0">Comment</button>
        </div>
    </form>
    <div class="ms-auto" v-else-if="state.isLoggedIn">
        <button @click="addComment">Add a comment</button>
    </div>
    <hr class="my-4 comment-border" v-if="state.isLoggedIn">
    <div class="comment mt-4" v-for="comment in comments" :key="comment._id">
        <form v-if="comment.isEditing" @submit.prevent="editComment(comment)" class="d-flex flex-col">
            <textarea class="cmt-comment my-3" v-model="form.comment" name="comment" placeholder="Comment"></textarea>
            <div class="row">
                <button class="btn-warning cmt-cancel ms-auto my-4 col-sm-2" type="reset" @click="onEditCancel(comment)">Cancel</button>
                <button class="btn-primary ms-sm-4 my-4 col-sm-2" type="submit" :disabled="form.comment.length == 0">Save</button>
            </div>
        </form>
        <div v-else>
            <div class="mb-4">
                <h5 class="d-inline">{{ comment.author.name }}</h5>
                <small>on {{ formatDate(comment.time) }}</small>
            </div>
            <div v-html="markdown(comment.comment)"></div>
            <div v-if="canDelete(comment.author._id)" class="row mb-4">
                <button @click="onDelete(comment)" class="btn-danger col col-sm-2 ms-auto mt-4">Delete</button>
                <button v-if="canEdit(comment.author._id)" @click="onEdit(comment)" class="btn-warning col col-sm-2 ms-4 mt-4">Edit</button>
            </div>
        </div>
    </div>
    <p v-if="comments.length == 0">
        There are no comments yet :/
    </p>
</div>
</template>

<script>
import dateFormat from '../dateFormat'
import axios from 'axios';
import cookie from 'js-cookie';
import marked from 'marked';
import DOMPurify from 'dompurify';
import state from '../state';

export default {
    name: "Comments",
    data() {
        return {
            form: {
                comment: '',
            },
            editing: null,
            comments: [],
            makingComment: false,
            state: state.state,
        };
    },
    props: {
        id: String,
    },
    methods: {
        async makeComment(event) {
            try {
                let result = await axios.post('/api/comment/new', {
                    comment: this.form.comment,
                    post: this.id,
                }, {
                    headers: {
                        XTOKEN: cookie.get('XTOKEN'),
                    },
                });
                if (result.data.success == false) {
                    console.error(`Could not post comment: ${result.data.msg}`);
                    return;
                }
                this.comments.unshift(result.data.comment);
                this.makingComment = false;
                this.form.comment = '';
            } catch (error) {
                let response = error.response;
                if (response.data.msg) {
                    alert(`Could not make comment: ${response.data.msg}`);
                } else {
                    console.error(error)
                }
            }
        },
        addComment() {
            this.stopEditing();
            this.makingComment = true;
            this.form.comment = '';
        },
        formatDate(date) {
            return dateFormat.dateFormat(date, "mmm dd, yy @ hh:MM tt");
        },
        onCancel() {
            this.form.comment = '';
            this.makingComment = false;
        },
        markdown(body) {
            return DOMPurify.sanitize(marked.parse(body));
        },
        canEdit(id) {
            return this.state.user != null && this.state.user._id == id;
        },
        canDelete(id) {
            return this.state.user != null && (this.state.user._id == id || this.state.user.isAdmin);
        },
        onEdit(comment) {
            this.stopEditing();
            this.form.comment = comment.comment;
            this.editing = comment;
            comment.isEditing = true;
        },
        onEditCancel(comment) {
            comment.isEditing = false;
            this.form.comment = '';
        },
        async onDelete(comment) {
            try {
                let result = await axios.delete(`/api/comment/delete/${comment._id}`, {
                    headers: {
                        XTOKEN: this.state.getToken(),
                    },
                });
                if (result.data.success == false) {
                    alert(`Could not delete comment: ${response.data.msg}`);
                    return;
                }
                let index = this.comments.indexOf(comment);
                this.comments.splice(index, 1);
            } catch (error) {
                let response = error.response;
                if (response.data.msg) {
                    alert(`Could not delete comment: ${response.data.msg}`);
                } else {
                    console.error(error);
                }
            }
        },
        async editComment(comment) {
            try {
                let result = await axios.post(`/api/comment/edit/${comment._id}`, {
                    comment: this.form.comment,
                }, {
                    headers: {
                        XTOKEN: this.state.getToken(),
                    },
                });
                if (result.data.success == false) {
                    alert(`Could not edit comment: ${result.data.msg}`);
                    return;
                }
                console.log(result.data);
                let found = this.comments.indexOf(comment);
                let removed = this.comments.splice(found, 1)[0];
                removed.comment = result.data.comment.comment;
                removed.time = result.data.comment.time;
                this.comments.unshift(removed);
                this.stopEditing();
                this.form.comment = '';
            } catch (error) {
                let response = error.response;
                if (response) {
                    if (response.data.msg) {
                        alert(`Could not edit comment: ${response.data.msg}`);
                    } else {
                        console.error(error);
                    }
                } else {
                    console.error(error);
                }
            }
        },
        stopEditing() {
            this.makingComment = false;
            if (this.editing != null) {
                this.editing.isEditing = false;
                this.editing = null;
            }
        }
    },
    async beforeMount() {
        try {
            // Fetch the data for the post
            let result = await axios.get(`/api/post/${this.id}`);
            this.comments = [];
            for (let comment of result.data.comments) {
                comment.isEditing = false;
                this.comments.push(comment);
            }
        } catch (error) {
            console.error(error);
        }
    }
};
</script>

<style scoped>

.cmt-comment {
    min-height: 10em;
}

.text-gray {
    color: var(--text-gray);
}

.comment-border {
    border: solid 1px var(--text-gray);
}

.comment  {
    border-bottom: solid 1px var(--text-gray);
}

</style>