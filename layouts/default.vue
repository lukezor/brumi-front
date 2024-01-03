<template>
    <!-- <div class="container is-widescreen pt-0"> -->
    <div class="body">
      <div class="content-area">
        <nuxt />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {};
    },
  };
  </script>
  
  <style>
  *{
    margin:0;
    padding:0;
    box-sizing: border-box;
    font-family: sans-serif;
  }
  .body {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .content-area{
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 25px;
    background-color: #EEE;
  }
  a{
    text-decoration: none;
  }
  
  </style>
  