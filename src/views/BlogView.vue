<script>
export default {
  name: "ExperienceView",
  data() {
    return {
    experiences: [
  {
    id: 1,
    role: "Web3 Fullstack Developer",
    company: "MYGOLD Token",
    year: "Jul 2025 - Sep 2025",
    description:
      "Developed a Web3 cryptocurrency platform using React.js and Tailwind CSS. Implemented wallet connection features, multilingual interface (i18n), and integrated GemPad for token transactions. Deployed the platform using Docker on a VPS and collaborated with international developers."
  },
  {
    id: 2,
    role: "Front-End Web Developer",
    company: "PT. Bumi Pangan Export",
    year: "Jun 2025 - Jul 2025",
    description:
      "Built a responsive company website using React.js with multilingual support (Mandarin, English, Indonesian). Optimized performance using lazy loading and bundle optimization, and deployed the website on Hostinger with full hosting, domain, and SSL configuration."
  },
  {
    id: 3,
    role: "Front-End Web Developer",
    company: "PT. Sanjungan Emas Mulia",
    year: "Aug 2025 - Sep 2025",
    description:
      "Developed a responsive React.js website with reusable components and React Hooks for state management. Integrated real-time gold price APIs, optimized performance with code splitting and lazy loading, and maintained production deployment."
  },
  {
    id: 4,
    role: "Front-End Web Developer",
    company: "PT. Baraka Dhahabu Africa",
    year: "Jul 2025 - Aug 2025",
    description:
      "Built a responsive web platform using React.js with modular components and API integration for real-time gold price updates. Implemented bilingual support (Indonesian-English) using i18n and managed production deployment."
  },
  {
    id: 5,
    role: "Fullstack Web Developer Intern",
    company: "PT Teknomadya Solusi Teknologi",
    year: "Jun 2024 - Dec 2024",
    description:
      "Developed an integrated dashboard system using Next.js for work order management and scheduling. Built real-time interfaces connecting admin and worker portals. Also created a Python web scraping system to migrate 25,000+ e-commerce product data."
  },
  {
    id: 6,
    role: "Fullstack Web & Mobile Development Training",
    company: "ITBOX Academy",
    year: "Jan 2023 - Jun 2025",
    description:
      "Completed intensive training in fullstack web development using JavaScript, React.js, Express.js, PostgreSQL, and REST APIs. Built multiple fullstack applications and also developed cross-platform mobile apps using Flutter and Dart."
  }
]
    };
  }
};
</script>

<template>

<div class="px-6 md:px-20 py-16 text-slate-200">

  <!-- TITLE -->

  <div class="text-center mb-16">
    <h1 class="text-3xl md:text-4xl font-bold text-white">
      Professional Experience
    </h1>

    <p class="text-slate-400 mt-2">
      My journey in technology and development
    </p>

    <div class="h-[2px] w-40 bg-blue-500 mx-auto mt-4"></div>
  </div>


  <!-- TIMELINE -->

  <div class="relative max-w-4xl mx-auto">

    <!-- vertical line -->

    <div class="absolute left-4 top-0 h-full w-[2px] bg-blue-900"></div>


    <!-- EXPERIENCE ITEM -->

   <div
  v-for="exp in experiences"
  :key="exp.id"
  class="relative pl-12 pb-12 fade-slide">

      <!-- timeline dot -->

      <div class="absolute left-0 top-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40">
        <div class="w-3 h-3 bg-white rounded-full"></div>
      </div>

      <!-- card -->

      <div class="timeline-card bg-[#05070f] border border-blue-900 rounded-xl p-6 hover:bg-blue-950">

        <div class="flex justify-between flex-wrap mb-2">

          <h2 class="text-lg md:text-xl font-semibold text-blue-400">
            {{ exp.role }}
          </h2>

          <span class="text-sm text-slate-400">
            {{ exp.year }}
          </span>

        </div>

        <p class="text-slate-300 mb-2">
          {{ exp.company }}
        </p>

        <p class="text-slate-400 leading-relaxed">
          {{ exp.description }}
        </p>

      </div>

    </div>

  </div>

</div>

</template>

<style>
.fade-slide {
  opacity: 0;
  transform: translateY(40px);
  animation: fadeSlideUp 0.8s ease forwards;
}

.fade-slide:nth-child(1){
animation-delay: 0.2s;
}

.fade-slide:nth-child(2){
animation-delay: 0.4s;
}

.fade-slide:nth-child(3){
animation-delay: 0.6s;
}

.fade-slide:nth-child(4){
animation-delay: 0.8s;
}

@keyframes fadeSlideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeline-card {
transition: all 0.3s ease;
}

.timeline-card:hover{
transform: translateY(-6px);
box-shadow: 0 0 30px rgba(37,99,235,0.35);
}

</style>