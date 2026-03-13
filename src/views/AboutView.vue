<script>
export default {
  data() {
    return {
      activeTab: 1,
      tech: [
        {
          id: 1,
          name: 'HTML',
          imageUrl: 'https://cdn-icons-png.flaticon.com/512/1051/1051277.png',
          status: 'Advanced'
        },
        {
          id: 2,
          name: 'CSS',
          imageUrl: 'https://cdn-icons-png.flaticon.com/512/732/732190.png',
          status: 'Advanced'
        },
        {
          id: 3,
          name: 'PHP',
          imageUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-php-2038871-1720084.png',
          status: 'Advanced'
        },
        {
          id: 4,
          name: 'Javascript',
          imageUrl: 'https://cdn.icon-icons.com/icons2/2415/PNG/512/javascript_original_logo_icon_146455.png',
          status: 'Advance'
        },
     {
  id: 5,
  name: 'Dart',
  imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg',
  status: 'Beginner'
},
      {
  id: 6,
  name: 'Next.js',
  imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
  status: 'Advance'
},
        {
          id: 7,
          name: 'VueJS',
          imageUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-vue-282497.png?f=webp',
          status: 'Intermediate'
        },
     {
  id: 8,
  name: 'Python',
  imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  status: 'Intermediate'
},
        {
          id: 9,
          name: 'NodeJS',
          imageUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-node-js-1174925.png',
          status: 'Intermediate'
        },
        {
          id: 10,
          name: 'Tailwind',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg',
          status: 'Advance'
        },
        {
          id: 11,
          name: 'Bootstrap',
          imageUrl: 'https://getbootstrap.com/docs/5.2/assets/brand/bootstrap-logo-shadow.png',
          status: 'Advance'
        },
        {
          id: 12,
          name: 'ReactJS',
          imageUrl: 'https://cdn4.iconfinder.com/data/icons/logos-3/600/React.js_logo-512.png',
          status: 'Advance'
        }
      ],
      tools: [
        {
          id: 1,
          name: 'Git',
          imageUrl: 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png',
          status: 'Version Control'
        },
        {
          id: 2,
          name: 'GitHub',
          imageUrl: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
          status: 'Git Hosting'
        },
        {
          id: 3,
          name: 'NPM',
          imageUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-npm-3-1175132.png',
          status: 'Package Manager'
        },
        {
          id: 4,
          name: 'MySQL',
          imageUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968313.png',
          status: 'Database'
        },
      ]
    };
  }
}
</script>
<template>
  <div
  
  class="bg-[#05070f] px-5 py-5 md:px-12 md:py-10 text-left border border-blue-900 rounded-3xl text-slate-200 mx-3 md:mx-8 mb-5 max-w-full">

    <article data-page="about">

      <header>
        <div class="text-2xl font-bold text-white mb-5 fadein-bot title-section flex items-center">
          About Me &nbsp;
          <div class="h-[1px] w-32 bg-blue-500 md:w-96"></div>
        </div>
      </header>

      <section
        class="text-sm md:text-lg text-justify flex flex-col gap-4 md:flex-row md:gap-8 md:justify-left md:items-center">

        <div class="flex justify-center">
  <img
    class="w-[180px] md:w-[220px] lg:w-[250px] rounded-full mb-3 fadein-up border-4 border-blue-800 shadow-[0_0_40px_rgba(37,99,235,0.4)]"
    src="../assets/kiki.jpg"
    alt="Foto">
</div>

        <div class="md:w-7/12">

          <p class="mb-3 md:mb-7 fadein-left fadeins-1 text-slate-300">
            Hi everyone! My name is Rizky Maulana Ibrohim. I'm a Full-stack developer with 2+ years of experience building scalable web applications and Web3 platforms. Experienced in developing integrated operational dashboards and managing large-scale datasets (25,000+ products). Proficient in JavaScript, Next.js, React, and Python, with hands-on experience building real-time systems. Currently expanding expertise in UI/UX design to grow as a well-rounded T-shaped developer.
          </p>

          <p class="mb-3 fadein-left fadeins-2 text-slate-400">
            My job is to build your website to be functional and user-friendly yet still attractive.
            In addition, I provide a personal touch to your product and ensure that the website
            catches attention and is easy to use.

            My goal is to convey your message and identity in the most creative way.
          </p>

        </div>

      </section>

    </article>
  </div>


  <div class="px-5 py-5 md:px-12 md:py-10 text-left text-slate-200 mx-3">

    <article data-page="about">

      <header>
        <div class="text-2xl font-bold text-white mb-5 fadein-bot title-section flex items-center">
          <div class="h-[1px] w-10 bg-blue-500 md:w-20"></div>
          &nbsp; Skills
        </div>
      </header>

      <section>

        <div>
          <ul class="flex flex-wrap text-sm font-medium text-center text-gray-400 mb-5">

            <li class="mr-2">
              <button
                class="inline-block px-4 py-3 rounded-lg hover:text-white transition"
                :class="{ 'text-blue-400 bg-blue-900 bg-opacity-40': activeTab === 1 }"
                @click="activeTab = 1">
                Tech Stack
              </button>
            </li>

            <li class="mr-2">
              <button
                class="inline-block px-4 py-3 rounded-lg hover:text-white transition"
                :class="{ 'text-blue-400 bg-blue-900 bg-opacity-40': activeTab === 2 }"
                @click="activeTab = 2">
                Tools
              </button>
            </li>

          </ul>
        </div>

        <!-- TECH STACK -->

        <div v-show="activeTab === 1">
          <div class="grid grid-cols-2 gap-4 pb-32 md:grid-cols-3 md:gap-8 xl:grid-cols-4 xl:gap-10">

            <div v-for="item in tech" :key="item.id">

              <div
                class="item-tech flex cursor-pointer items-center gap-2 rounded border border-blue-900 px-2 py-2 hover:bg-blue-900 hover:bg-opacity-30 transition md:gap-3 lg:px-3">

                <div class="flex h-12 w-12 items-center justify-center lg:h-16 lg:w-16 zoom-in">
                  <img
                    class="img-tech drop-shadow-xl transition-all duration-300 h-[65%] w-[65%] lg:h-[85%] lg:w-[85%]"
                    :src="item.imageUrl">
                </div>

                <div class="flex items-center text-sm md:text-base lg:text-lg">

                  <div class="tech font-medium text-slate-200 transition-all duration-300">
                    {{ item.name }}
                  </div>

                  <div
                    class="status-tech opacity-0 absolute mt-5 text-[10px] text-blue-400 transition-all duration-300 md:text-xs lg:text-sm">
                    {{ item.status }}
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>


        <!-- TOOLS -->

        <div v-show="activeTab === 2">
          <div class="grid grid-cols-2 gap-4 pb-32 md:grid-cols-3 md:gap-8 xl:grid-cols-4 xl:gap-10">

            <div v-for="item in tools" :key="item.id">

              <div
                class="item-tech flex cursor-pointer items-center gap-2 rounded border border-blue-900 px-2 py-2 hover:bg-blue-900 hover:bg-opacity-30 transition md:gap-3 lg:px-3">

                <div class="flex h-12 w-12 items-center justify-center lg:h-16 lg:w-16 zoom-in">
                  <img
                    class="img-tech drop-shadow-xl transition-all duration-300 h-[65%] w-[65%] lg:h-[85%] lg:w-[85%]"
                    :src="item.imageUrl">
                </div>

                <div class="flex items-center text-sm md:text-base lg:text-lg">

                  <div class="tech font-medium text-slate-200">
                    {{ item.name }}
                  </div>

                  <div
                    class="status-tech opacity-0 absolute mt-5 text-[10px] text-blue-400 transition-all duration-300 md:text-xs lg:text-sm">
                    {{ item.status }}
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

      </section>

    </article>
  </div>
</template>

<style>
.fadein-left {
  opacity: 0;
  animation: fadeInLeft 0.5s ease-out forwards;
}

@keyframes fadeInLeft {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.fadeins-1 {
  animation-delay: 500ms;
}

.fadeins-2 {
  animation-delay: 800ms;
}

.img-tech,
.tech {
  transition: transform 0.3s ease;
}

.item-tech:hover .img-tech {
  transform: scale(1.3);
}

.item-tech:hover .tech {
  transform: translateY(-12px);
}

.item-tech:hover .status-tech {
  opacity: 1;
}
</style>
