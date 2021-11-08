<template>
<div class="my-4">
    <form class="d-flex flex-col" v-if="makingComment" @submit.prevent="makeComment">
        <input class="cmt-name col-sm-3 my-3" type="text" v-model="form.name" name="name" placeholder="Name">
        <textarea class="cmt-comment my-3" v-model="form.comment" name="comment" placeholder="Comment"></textarea>
        <button class="cmt-submit ms-auto col-6 col-sm-3 col-md-2 col-lg-1 my-3" type="submit">Comment</button>
    </form>
    <div class="ms-auto" v-else>
        <button @click="addComment">Add a comment</button>
    </div>
    <hr class="my-4 comment-border">
    <div class="comment mt-4" v-for="comment in comments" :key="comment.date">
        <div class="mb-4">
            <h5 class="d-inline">{{ comment.name }}</h5>
            <small>on {{ formatDate(comment.date) }}</small>
        </div>
        <p>{{ comment.comment }}</p>
    </div>
    <p v-if="comments.length == 0">
        There are no comments yet :/
    </p>
    <p class="text-gray mt-4">
        <small>Please note that these comments are not yet implemented with a server.
        For now, this is a mockup of how I want comments to appear and act in
        the future.</small>
    </p>
</div>
</template>

<script>
import dateFormat from '../dateFormat'
import mockData from '../mockData'

// TODO: implement an server-side api that uses a UUID as the comment group

export default {
    name: "Comments",
    data() {
        return {
            form: {
                name: '',
                comment: '',
            },
            comments: [],
            makingComment: false,
        };
    },
    props: {
        id: String,
    },
    methods: {
        makeComment(event) {
            this.comments.push({
                name: this.form.name,
                comment: this.form.comment,
                date: new Date(),
            });
            this.makingComment = false;
            this.form.name = '';
            this.form.comment = '';
        },
        addComment() {
            this.makingComment = true;
        },
        formatDate(date) {
            return dateFormat.dateFormat(date, "mmm dd, yy @ hh:MM tt");
        }
    },
    beforeMount() {
        if (mockData.comments[this.id] != undefined) {
            let arr = [];
            mockData.comments[this.id].forEach((value) => {
                this.comments.push(value);
            });
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