<script setup>
import { onMounted } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  id: {
    type: String,
    default: "chart-line",
  },
  height: {
    type: String,
    default: "100",
  },
  title: {
    type: String,
    default: "Mini Gradient Line Chart",
  },
  description: {
    type: String,
    default: "",
  },
  chart: {
    type: Object,
    required: true,
    labels: Array,
    datasets: {
      type: Array,
      label: String,
      data: Array,
    },
  },
});

onMounted(() => {
  var ctx = document.getElementById(props.id).getContext("2d");

  var gradientStroke1 = ctx.createLinearGradient(0, 230, 0, 50);

  gradientStroke1.addColorStop(1, "rgba(203,12,159,0.02)");
  gradientStroke1.addColorStop(0.2, "rgba(72,72,176,0.0)");
  gradientStroke1.addColorStop(0, "rgba(203,12,159,0)"); //purple colors

  let chartStatus = Chart.getChart(props.id);
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }
  new Chart(ctx, {
    type: "line",
    data: {
      labels: props.chart.labels,
      datasets: [
        {
          label: props.chart.datasets.label,
          tension: 0.5,
          borderWidth: 0,
          pointRadius: 0,
          borderColor: "#4BB543",
          // eslint-disable-next-line no-dupe-keys
          borderWidth: 2,
          backgroundColor: gradientStroke1,
          data: props.chart.datasets[0].data,
          maxBarThickness: 6,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      scales: {
        y: {
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
          },
          ticks: {
            // eslint-disable-next-line no-unused-vars
            callback: function (value, index, values) {
              return "$" + value;
            },
            display: true,
            padding: 10,
            color: "#9ca2b7",
          },
        },
        x: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
          },
          ticks: {
            display: true,
            padding: 10,
            color: "#9ca2b7",
          },
        },
      },
    },
  });
});
</script>
<template>
  <div class="overflow-hidden card">
    <div class="p-3 pb-0 card-header">
      <p class="mb-0 text-sm text-capitalize font-weight-bold">
        {{ props.title }}
      </p>
      <!-- eslint-disable vue/no-v-html -->
      <h5 class="mb-0 font-weight-bolder" v-html="props.description"></h5>
    </div>
    <div class="p-0 card-body">
      <div class="chart">
        <canvas
          :id="props.id"
          class="chart-canvas"
          :height="props.height"
        ></canvas>
      </div>
    </div>
  </div>
</template>
