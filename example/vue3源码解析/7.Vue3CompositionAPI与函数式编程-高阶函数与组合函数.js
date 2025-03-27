import {ref, onMounted} from 'vue'

function useFetch(url) {
    const data = ref(null)
    const error = ref(null)

    onMounted(async () => {
        try {
            const response = await fetch(url)
            data.value = await response.json()
        } catch (err) {
            error.value = err
        }
    })

    return {
        data,
        error
    }
}

const { data, error } = useFetch('https://api.example.com/data')

export default {
    setup() {
        return {
            data,
            error
        }
    }
}