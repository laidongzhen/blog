function useCounter() {
  const count = ref(0);
  const increment = () => {
    count.value++;
  };
  return {
    count,
    increment,
  };
}

function useDoubleCounter() {
  const { count, increment } = useCounter();
  const doubleCount = computed(() => count.value * 2);
  return {
    count,
    doubleCount,
    increment,
  };
}

const {count, doubleCount, increment} = useDoubleCounter();