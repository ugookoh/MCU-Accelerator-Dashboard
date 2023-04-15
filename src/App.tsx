import React, { useEffect, useRef, useState } from "react";
import styles from "./App.module.css";
import { AnimatedTextBox } from "./components";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useSpring, animated } from "@react-spring/web";
import { Line } from "react-chartjs-2";
import MoonLoader from "react-spinners/MoonLoader";
//@ts-ignore
import faker from "faker";
//@ts-ignore
import Hammer from "hammerjs";
import zoom from "chartjs-plugin-zoom";
import { calculateVelocity, getCalculations, handleFileUpload } from "./utils";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoom);

function App() {
  const [loading, setLoading] = useState(false);
  const inputFile = useRef<any>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [data, setData] = useState<any>(null);
  const [gyroData, setGyroData] = useState<any>(null);
  const [velocityData, setVelocityData] = useState<any>(null);
  const [calculations, setCalculations] = useState<any>({});
  const [props, startProps] = useSpring(() => ({
    from: { opacity: 0 },
  }));
  useEffect(() => {
    setTimeout(showContent, 750);
  }, []);

  const showContent = () => {
    startProps({
      from: { opacity: 0 },
      to: { opacity: 1 },
    });
  };
  const hideContent = () => {
    startProps({
      from: { opacity: 1 },
      to: { opacity: 0 },
    });
  };

  const handleDrag = function (e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // triggers when file is dropped
  const handleDrop = function (e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.includes("csv")) {
      submit(files);
    }
  };

  const submit = (files: FileList | null) => {
    try {
      setLoading(true);
      hideContent();
      setTimeout(async () => {
        const result = (await handleFileUpload(files)) as any[];
        setData({
          labels: result.map((item, index) => index),
          datasets: [
            {
              label: "x-acceleration",
              data: result.map((item) => Number(item[0])),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
              label: "y-acceleration",
              data: result.map((item) => Number(item[1])),
              borderColor: "rgb(53, 162, 235)",
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
            {
              label: "z-acceleration",
              data: result.map((item) => Number(item[2])),
              borderColor: "rgb(217, 65, 176)",
              backgroundColor: "rgba(217, 65, 176, 0.5)",
            },
          ],
        });
        setVelocityData({
          labels: result.map((item, index) => index),
          datasets: [
            {
              label: "x-velocity",
              data: calculateVelocity(
                result.map((item) => [Number(item[0])]),
                0.2
              ),
              borderColor: "rgb(232, 99, 255)",
              backgroundColor: "rgba(232, 99, 255, 0.5)",
            },
            {
              label: "y-velocity",
              data: calculateVelocity(
                result.map((item) => [Number(item[1])]),
                0.2
              ),
              borderColor: "rgb(128, 99, 255)",
              backgroundColor: "rgba(128, 99, 255, 0.5)",
            },
            {
              label: "z-velocity",
              data: calculateVelocity(
                result.map((item) => [Number(item[2])]),
                0.2
              ),
              borderColor: "rgb(255, 99, 99)",
              backgroundColor: "rgba(255, 99, 99, 0.5)",
            },
          ],
        });
        setGyroData({
          x: {
            labels: result.map((item, index) => index),
            datasets: [
              {
                label: "x-rotation",
                data: result.map((item) => Number(item[3])),
                borderColor: "rgb(71, 231, 69)",
                backgroundColor: "rgba(71, 231, 69, 0.5)",
              },
            ],
          },
          y: {
            labels: result.map((item, index) => index),
            datasets: [
              {
                label: "y-rotation",
                data: result.map((item) => Number(item[4])),
                borderColor: "rgb(69, 199, 231)",
                backgroundColor: "rgba(69, 199, 231, 0.5)",
              },
            ],
          },
          z: {
            labels: result.map((item, index) => index),
            datasets: [
              {
                label: "z-rotation",
                data: result.map((item) => Number(item[5])),
                borderColor: "rgb(226, 231, 82)",
                backgroundColor: "rgba(226, 231, 82, 0.5)",
              },
            ],
          },
        });
        const calculations = getCalculations(result);
        setCalculations(calculations);
        setLoading(false);
        showContent();
      }, 1000);
    } catch (error) {
      setLoading(false);
      showContent();
      setData(null);
      alert(JSON.stringify(error));
    }
  };

  return (
    <html>
      {loading ? (
        <MoonLoader color={"#fff"} size={50} />
      ) : !data ? (
        <animated.div
          onDragEnter={handleDrag}
          onDrop={handleDrop}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          className={styles.container}
          style={{ ...props, justifyContent: "center", alignItems: "center" }}
        >
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files[0] && files[0].type.includes("csv")) {
                submit(files);
              }
            }}
            style={{ display: "none" }}
            ref={inputFile}
          />
          <div
            className={styles.uploadCont}
            onClick={() => {
              inputFile?.current?.click();
            }}
          >
            <img src="/upload.png" alt="image" className={styles.image} />
            <p className={styles.uploadCSV}>
              {dragActive ? "Drop .csv file here" : "Click or drag your .csv file to upload"}
            </p>
          </div>
        </animated.div>
      ) : (
        <animated.div className={styles.container} style={props}>
          <p className={styles.title}>Sports Concussive Acceleration Analysis & Recording System (SCARRS)</p>
          <p className={styles.subtitle} style={{ marginTop: "15px" }}>
            Quick stats
          </p>
          <div className={styles.itemsView}>
            <AnimatedTextBox
              title="Maximum Acceleration in x-axis"
              value={calculations?.max_x_acceleration || 0}
              unit={
                <span>
                  m/s<sup>2</sup>
                </span>
              }
            />
            <AnimatedTextBox
              title="Maximum Acceleration in y-axis"
              value={calculations?.max_y_acceleration || 0}
              unit={
                <span>
                  m/s<sup>2</sup>
                </span>
              }
            />
            <AnimatedTextBox
              title="Maximum Acceleration in z-axis"
              value={calculations?.max_z_acceleration || 0}
              unit={
                <span>
                  m/s<sup>2</sup>
                </span>
              }
            />
            <AnimatedTextBox
              title="Estimated amount of collisions"
              value={calculations?.collisions || 0}
              unit={<span>collisions</span>}
            />
            <AnimatedTextBox
              title="Maximum Rotation in x-axis"
              value={calculations?.max_x_rotation || 0}
              unit={<span>dps</span>}
            />
            <AnimatedTextBox
              title="Maximum Rotation in y-axis"
              value={calculations?.max_y_rotation || 0}
              unit={<span>dps</span>}
            />
            <AnimatedTextBox
              title="Maximum Rotation in z-axis"
              value={calculations?.max_z_rotation || 0}
              unit={<span>dps</span>}
            />
          </div>
          <p className={styles.subtitle} style={{ marginTop: "15px" }}>
            Graphical Analysis of Acceleration
          </p>
          <div className={styles.chartDiv}>
            <Line
              width={"100%"}
              data={data}
              className={styles.line}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  title: {
                    display: true,
                    text: "Acceleration Analysis",
                  },
                },
                maintainAspectRatio: false,
                //@ts-ignore
                zoom: {
                  enabled: true,
                  mode: "xy",
                },
                pan: {
                  enabled: true,
                  mode: "xy",
                },
              }}
            />
          </div>
          <p className={styles.subtitle} style={{ marginTop: "35px" }}>
            Calculations and Analytics
          </p>
          <div className={styles.itemsView}>
            <AnimatedTextBox title={"Total Session Time"} value={calculations?.totalTime || 0} unit={<></>} noAnimate />
            <AnimatedTextBox
              title={"Estimated amount of steps"}
              value={calculations?.steps || 0}
              unit={<span>steps</span>}
            />
          </div>
          {/* <p className={styles.subtitle} style={{ marginTop: "15px" }}>
            Graphical Analysis of Estimated Velocity
          </p>
          <div className={styles.chartDiv}>
            <Line
              width={"100%"}
              data={velocityData}
              className={styles.line}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  title: {
                    display: true,
                    text: "Acceleration Analysis",
                  },
                },
                maintainAspectRatio: false,
                //@ts-ignore
                zoom: {
                  enabled: true,
                  mode: "xy",
                },
                pan: {
                  enabled: true,
                  mode: "xy",
                },
              }}
            />
          </div> */}
          <p className={styles.subtitle} style={{ marginTop: "35px" }}>
            Graphical Analysis of Rotational Acceleration
          </p>
          <div className={styles.chartDiv2} style={{ width: "100%" }}>
            <div style={{ width: "47%", height: "300px" }}>
              <Line
                width={"100%"}
                data={gyroData.x}
                className={styles.line}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                    title: {
                      display: true,
                      text: "X-rotation Analysis",
                    },
                  },
                  maintainAspectRatio: false,
                  //@ts-ignore
                  zoom: {
                    enabled: true,
                    mode: "xy",
                  },
                  pan: {
                    enabled: true,
                    mode: "xy",
                  },
                }}
              />
            </div>
            <div style={{ width: "47%", marginLeft: "4%", height: "300px" }}>
              <Line
                width={"100%"}
                data={gyroData.y}
                className={styles.line}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                    title: {
                      display: true,
                      text: "Y-rotation Analysis",
                    },
                  },
                  maintainAspectRatio: false,
                  //@ts-ignore
                  zoom: {
                    enabled: true,
                    mode: "xy",
                  },
                  pan: {
                    enabled: true,
                    mode: "xy",
                  },
                }}
              />
            </div>
            <div style={{ width: "100%", height: "300px", marginTop: "20px" }}>
              <Line
                width={"100%"}
                data={gyroData.z}
                className={styles.line}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                    title: {
                      display: true,
                      text: "Z-rotation Analysis",
                    },
                  },
                  maintainAspectRatio: false,
                  //@ts-ignore
                  zoom: {
                    enabled: true,
                    mode: "xy",
                  },
                  pan: {
                    enabled: true,
                    mode: "xy",
                  },
                }}
              />
            </div>
          </div>
        </animated.div>
      )}
    </html>
  );
}

export default App;
