<script>
  import { onMount } from "svelte";
  import { useRouter } from "./index";
  export let page;
  onMount(() => {
    let currentPath = window.location.pathname;
    console.log("@svelteuse/router:", currentPath);
    $useRouter.currentPath = currentPath;
  });

  window.onpopstate = function (event) {
    let currentPath = window.location.pathname;
    console.log("@svelteuse/router:", currentPath);
  };
</script>

<!-- <svelte:window on:popstate={onPopstate} /> -->

<svelte:component this={page} />

<style>
  :root {
    --svelteuse: #ff3e00;
  }
</style>
