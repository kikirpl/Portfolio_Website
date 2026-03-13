<template>
  <div class="max-w-7xl mx-auto flex flex-col relative">

    <!-- NAVBAR -->
    <nav class="max-w-7xl px-5 md:fixed top-0 z-[98] w-screen backdrop-blur-md bg-[#05070f] bg-opacity-90 border-b border-blue-900">
      <div class="container mx-auto flex flex-wrap items-center justify-between">
        
        <button @click="redirectToHome" class="flex">
          <span class="self-center text-lg text-blue-400 font-semibold whitespace-nowrap hover:text-blue-300 transition">
            RM1
          </span>
        </button>

        <div class="flex md:order-2">
          <a href="https://github.com/kikirpl">
            <img class="w-9 rounded-full border border-blue-900 p-1 bg-black"
              src="https://seeklogo.com/images/G/github-logo-2E3852456C-seeklogo.com.png"
              alt="github">
          </a>
        </div>

        <div class="hidden md:flex justify-between items-center w-full md:w-auto md:order-1">
          <ul class="flex-col md:flex-row flex md:space-x-8 mt-4 md:mt-0 md:text-sm md:font-medium">

            <li>
              <router-link to="/"
                class="text-gray-400 hover:text-blue-400 border-b border-gray-800 md:border-0 block pl-3 pr-4 py-2 md:p-0">
                Home
              </router-link>
            </li>

            <li>
              <router-link to="/about"
                class="text-gray-400 hover:text-blue-400 border-b border-gray-800 md:border-0 block pl-3 pr-4 py-2 md:p-0">
                About
              </router-link>
            </li>

            <li>
              <router-link to="/portfolio"
                class="text-gray-400 hover:text-blue-400 border-b border-gray-800 md:border-0 block pl-3 pr-4 py-2 md:p-0">
                Portfolio
              </router-link>
            </li>

            <li>
              <router-link to="/blog"
                class="text-gray-400 hover:text-blue-400 border-b border-gray-800 md:border-0 block pl-3 pr-4 py-2 md:p-0">
                Experience
              </router-link>
            </li>

          </ul>
        </div>
      </div>
    </nav>

    <div class="md:mt-[100px]">
      <router-view />
    </div>

  </div>

  <!-- MOBILE FOOTER -->
  <footer class="block md:hidden fixed bottom-0 left-0 right-0 rounded-t-3xl border border-blue-900 bg-[#05070f] bg-opacity-95 backdrop-blur-md">
    <nav class="flex justify-around py-4 text-xs">
      <router-link to="/" class="text-gray-400 hover:text-blue-400">Home</router-link>
      <router-link to="/about" class="text-gray-400 hover:text-blue-400">About</router-link>
      <router-link to="/portfolio" class="text-gray-400 hover:text-blue-400">Portfolio</router-link>
      <router-link to="/blog" class="text-gray-400 hover:text-blue-400">Experience</router-link>
    </nav>
  </footer>
</template>

<script>
export default {
  methods: {
    redirectToHome() {
      this.$router.push('/')
    }
  },
}
</script>

<style>

/* RESET */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* SCROLLBAR */

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #05070f;
}

::-webkit-scrollbar-thumb {
  background: #1e3a8a;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}

/* BODY */

body {
  font-family: 'Poppins', sans-serif;
  background: #020617;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #e2e8f0;
  height: 100vh;
}

/* ACTIVE LINK */

nav a.router-link-exact-active {
  color: #60a5fa;
}

nav a.router-link-exact-active::after {
  display: block;
  content: "";
  margin-top: 4px;
  width: 100%;
  height: 3px;
  border-radius: 3px;
  background-color: #1d4ed8;
}

</style>