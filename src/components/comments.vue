<template>
<div class="my-4">
    <form class="d-flex flex-col" v-if="makingComment" @submit.prevent="makeComment">
        <textarea class="cmt-comment my-3" v-model="form.comment" name="comment" placeholder="Comment"></textarea>
        <div class="row">
            <button class="btn-warning cmt-cancel ms-auto mt-4 col-sm-3" type="reset" @click="onCancel">Cancel</button>
            <button class="cmt-submit ms-sm-4 mt-4 col-sm-3" type="submit" :disabled="form.comment.length == 0">Comment</button>
        </div>
    </form>
    <div class="ms-auto" v-else-if="state.isLoggedIn">
        <button @click="addComment">Add a comment</button>
    </div>
    <hr class="my-4 comment-border" v-if="state.isLoggedIn">
    <div class="comment mt-4" v-for="comment in comments" :key="comment.date">
        <div class="mb-4">
            <h5 class="d-inline">{{ comment.author.name }}</h5>
            <small>on {{ formatDate(comment.time) }}</small>
        </div>
        <div v-html="markdown(comment.comment)"></div>
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
            this.makingComment = true;
        },
        formatDate(date) {
            return dateFormat.dateFormat(date, "mmm dd, yy @ hh:MM tt");
        },
        onCancel() {
            this.form.comment = null;
            this.makingComment = false;
        },
        markdown(body) {
            return DOMPurify.sanitize(marked.parse(body));
        }
    },
    async beforeMount() {
        try {
            // Fetch the post
            let result = await axios.get(`/api/post/${this.id}`);
            this.comments = result.data.comments;
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