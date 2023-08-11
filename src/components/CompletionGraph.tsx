import { Chart } from "chart.js/auto";
import { useEffect, useRef } from "react";

export default function CompletionGraph({ data }: { data: number[]; }) {
    const canvasEl = useRef(null);

    useEffect(() => {
        const ctx = (canvasEl.current as any).getContext("2d");

        const graphData = [...data];

        if (graphData.length < 2) {
            graphData.push(...Array(2 - graphData.length).fill(0));
        }

        const gradient = ctx.createLinearGradient(0, 16, 0, 600);
        gradient.addColorStop(0, "rgba(149, 76, 233, 0.5)");
        gradient.addColorStop(0.65, "rgba(149, 76, 233, 0.25)");
        gradient.addColorStop(1, "rgba(149, 76, 233, 0)");

        const myLineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: graphData.map((d, i) => `Day ${i + 1}`),
                datasets: [{
                    label: 'Current Streak',
                    data: graphData,
                    fill: false,
                    tension: 0.1,
                    borderWidth: 1,
                    cubicInterpolationMode: 'default',
                }],
            },
            options: {
                scales: {
                    y: {
                        display: false,
                        beginAtZero: true,
                        max: Math.max(...graphData) + 0.1 * Math.max(...graphData),
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                elements: {
                    point: {
                        radius: 0,
                    }
                },
            }
        });

        return function cleanup() {
            myLineChart.destroy();
        };
    });

    return (
        <div className="App">
            <canvas id="myChart" ref={canvasEl} height="200" />
        </div>
    );
}
