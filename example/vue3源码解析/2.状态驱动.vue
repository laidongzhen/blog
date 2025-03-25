<template>
    <div>
        <button @click="addParagraph">添加段落</button>
        <div id="content">
            <p v-for="(paragraph,index) in paragraphs" :key="index">{{ paragraph}}</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const paragraphs = ref(['段落1', '段落2'])

const addParagraph = () => {
    paragraphs.value.push(`段落${paragraphs.value.length + 1}`)
}

</script>

<style scoped>
button {
    margin-bottom: 20px;
}
</style>