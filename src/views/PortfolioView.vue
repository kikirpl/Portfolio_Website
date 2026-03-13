<script>
export default {
  data() {
    return {
      activeTab: 1,
      items: [
        {
          id: 1,
          name: 'MyGold Web3',
          imageUrl: 'mygold',
          status: 'Built the frontend of a Web3 gold tokenization platform with wallet integration, multilingual interface, and modern UI.',
          tech: 'Ether JS, Javascript, Native',
          github: 'https://github.com/kikirpl',
          demo: 'https://mygoldtokenization.com'
        },
        {
          id: 2,
          name: 'PT. Pangan Makmur Nusantara',
          imageUrl: 'pangan',
          status: 'Responsive company profile website for an agribusiness company specializing in fresh and frozen chicken production, processing, cold storage, and distribution.',
          tech: 'HTML, Bootstrap',
          github: 'https://github.com/kikirpl',
          demo: 'https://panganmakmurnusantara.com'
        },
        {
          id: 3,
          name: 'PT Bangun Merah Putih',
          imageUrl: 'bangun',
          status: 'Developed a responsive company profile website for a construction and infrastructure company.',
          tech: 'HTML, Bootstrap',
          github: 'null',
          demo: 'https://bangunmerahputih.com'
        },
        {
          id: 4,
          name: 'Fortuna Meat X',
          imageUrl: 'meat',
          status: 'Developed a responsive company website for a meat supply company offering premium beef and chicken products.',
          tech: 'HTML, Bootstrap',
          github: 'null',
          demo: 'https://fortunameatx.com'
        },
        {
          id: 5,
          name: 'Fortuna Poultry',
          imageUrl: 'fortuna',
          status: 'Responsive company profile website for an integrated poultry agribusiness company.',
          tech: 'HTML, Bootstrap',
          github: 'null',
          demo: 'https://fortunapoultry.com'
        },
        {
          id: 6,
          name: 'PT Baraka Dhahabu Africa',
          imageUrl: 'baraka',
          status: 'Developed a responsive company website for a gold trading company connecting Africa’s gold resources with the global market.',
          tech: 'React JS, Tailwind',
          github: 'null',
          demo: 'https://barakadhahabuafrica.com'
        },
        {
          id: 7,
          name: 'PT Sanjungan Emas Mulia',
          imageUrl: 'sanjungan',
          status: 'Company website for a gold enterprise dedicated to enhancing the value of Indonesian gold.',
          tech: 'React JS, Tailwind',
          github: 'null',
          demo: 'https://sanjunganemasmulia.com'
        },
        {
          id: 8,
          name: 'Edukode',
          imageUrl: 'edukode',
          status: 'Interactive coding education platform inspired by Duolingo.',
          github: 'null',
          demo: 'https://www.figma.com/proto/y14Uaktv77WBjrwAr5iPjt/Final-Project-Kelompok-6'
        }
      ]
    }
  },

  methods: {
    openDemo(url) {
      if (url && url !== 'null') {
        window.open(url, "_blank")
      }
    }
  }
}
</script>
<template>
  <div class="px-5 py-5 md:px-12 md:py-10 text-left text-slate-200 mx-3">

    <article data-page="about">

      <header>
        <div
          class="text-2xl font-bold text-white mb-10 fadein-bot title-section flex items-center justify-center flex-col">

          <h4>Past Project Experience</h4>

          <h4 class="text-base font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-500">
            Explore the projects I've worked on so far
          </h4>

        </div>
      </header>

      <section>

        <div class="grid grid-cols-1 gap-4 pb-32 md:grid-cols-3 md:gap-4 fade-zoom-in">

          <div v-for="item in items" :key="item.id">

            <div
          @click="openDemo(item.demo)"
          class="item-card flex flex-col items-center gap-2 rounded bg-[#05070f] hover:bg-blue-950 border border-blue-900 rounded-xl text-slate-200 md:gap-3 px-5 py-5 cursor-pointer">
              <div class="flex h-12 w-12 items-center justify-center h-full w-full zoom-in">

                <img
                  class="drop-shadow-xl rounded-xl"
                  :src="'/img/portfolio-' + item.imageUrl + '.png'">

              </div>

              <div class="w-full flex flex-col gap-2 items-center text-sm md:text-base lg:text-lg">

                <div class="title-text font-medium text-white">
                  {{ item.name }}
                </div>

                <div class="w-full text-left text-[10px] text-gray-400 md:text-xs lg:text-sm">
                  {{ item.status }}
                </div>

                <div class="w-full mt-4 text-normal text-sm text-left text-blue-400">
                  {{ item.tech }}
                </div>

                <div class="w-full flex justify-end">

                  <div class="flex cursor-pointer items-end gap-2 text-gray-400">

                    <a v-if="item.github !== 'null'"
                      :href="item.github"
                      target="_blank"
                      title="View github repository"
                      class="transition-all hover:text-blue-400">

                      <!-- github icon -->

                      <svg stroke="currentColor"
                        fill="none"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        height="16"
                        width="16">

                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 
                        3.37 0 0 0-.94-2.61c3.14-.35 
                        6.44-1.54 6.44-7A5.44 5.44 
                        0 0 0 20 4.77 5.07 5.07 
                        0 0 0 19.91 1S18.73.65 
                        16 2.48a13.38 13.38 
                        0 0 0-7 0C6.27.65 5.09 
                        1 5.09 1A5.07 5.07 
                        0 0 0 5 4.77a5.44 
                        5.44 0 0 0-1.5 
                        3.78c0 5.42 3.3 6.61 
                        6.44 7A3.37 3.37 
                        0 0 0 9 18.13V22">
                        </path>

                      </svg>

                    </a>

                    <a v-if="item.demo !== 'null'"
                      :href="item.demo"
                      target="_blank"
                      title="View finished project"
                      class="transition-all hover:text-blue-400">

                      <!-- demo icon -->

                      <svg stroke="currentColor"
                        fill="none"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        height="18"
                        width="18">

                        <path d="M18 13v6a2 2 0 0 1-2 
                        2H5a2 2 0 0 1-2-2V8a2 
                        2 0 0 1 2-2h6"></path>

                        <polyline points="15 3 21 3 21 9"></polyline>

                        <line x1="10" y1="14" x2="21" y2="3"></line>

                      </svg>

                    </a>

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
.item-card:hover {
  transition: transform 0.3s ease;
  transform: translateY(-8px);
}
svg:hover{
  stroke: #3b82f6
}
@keyframes fadeZoomIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Menggunakan animasi pada elemen yang diinginkan */
.fade-zoom-in {
  animation: fadeZoomIn 1s ease-in-out;
}
</style>