import Papa from "papaparse";
import moment from "moment";

export const handleFileUpload = (files: FileList | null) => {
  if (!files) return;
  return new Promise((resolve, reject) => {
    try {
      Papa.parse(files[0], {
        complete: function (results) {
          const raw_data = results.data;
          const data: string[][] = [];
          for (let i = 1; i < raw_data.length; i++) {
            const item = raw_data[i] as any;
            if (item.length >= 6) data.push(item);
          }
          return resolve(data);
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const getCalculations = (data: string[][]) => {
  const calculations: { [key: string]: number | string } = {
    max_x_acceleration: 0,
    max_y_acceleration: 0,
    max_z_acceleration: 0,
    max_x_rotation: 0,
    max_y_rotation: 0,
    max_z_rotation: 0,
  };

  //Calculate max x,y & z values
  for (let i = 0; i < data.length; i++) {
    const x_acc = Number(data[i][0]);
    const y_acc = Number(data[i][1]);
    const z_acc = Number(data[i][2]);

    calculations.max_x_acceleration = Math.max(calculations.max_x_acceleration as number, x_acc);
    calculations.max_y_acceleration = Math.max(calculations.max_y_acceleration as number, y_acc);
    calculations.max_z_acceleration = Math.max(calculations.max_z_acceleration as number, z_acc);

    const x_gro = Number(data[i][3]);
    const y_gro = Number(data[i][4]);
    const z_gro = Number(data[i][5]);

    calculations.max_x_rotation = Math.max(calculations.max_x_rotation as number, x_gro);
    calculations.max_y_rotation = Math.max(calculations.max_y_rotation as number, y_gro);
    calculations.max_z_rotation = Math.max(calculations.max_z_rotation as number, z_gro);
  }

  //calculate the time
  const time = data.length * 250;
  const tempTime = moment.duration(time);
  const H = tempTime.hours() ? `${tempTime.minutes()} hours` : "";
  const M = tempTime.minutes() ? `${tempTime.minutes()} minutes` : "";
  const S = tempTime.seconds() ? `${tempTime.seconds()} seconds` : "";
  calculations.totalTime = `${H}${!!H && !!M ? "," : ""}${M}${!!M && !!S ? "," : ""}${S}`;

  //collisions
  const THRESHOLD_OF_COLLISION = 1;
  calculations.collisions = detectCollisions(
    data.map((item) => {
      return item.map((i) => Number(i));
    }),
    THRESHOLD_OF_COLLISION
  ).length;
  calculations.steps = countSteps(
    data.map((item) => {
      return item.map((i) => Number(i));
    }),
    0.8
  );

  //calculate collisions
  return calculations;
};

// Function to detect collisions in acceleration data
function detectCollisions(accelData: number[][], threshold: number) {
  const collisionIndexes = [];
  const windowSize = 5;
  const filterWindow = [];
  const len = accelData.length;
  let prevSpeed = 0;
  let speed = 0;

  // Iterate through each data point in the array
  for (let i = 0; i < len; i++) {
    // Update moving average filter window
    filterWindow.push(accelData[i]);
    if (filterWindow.length > windowSize) {
      filterWindow.shift();
    }

    // Calculate average acceleration over window
    const avgAccel = filterWindow
      .reduce((a, b) => a.map((x, i) => x + b[i]), [0, 0, 0])
      .map((x) => x / filterWindow.length);

    // Calculate speed based on change in acceleration
    speed += (avgAccel[0] + avgAccel[1] + avgAccel[2]) / 3 / len;

    // Check for collision based on change in speed
    if (i > 0) {
      const accelChange =
        Math.abs(avgAccel[0] - accelData[i - 1][0]) +
        Math.abs(avgAccel[1] - accelData[i - 1][1]) +
        Math.abs(avgAccel[2] - accelData[i - 1][2]);
      if (accelChange > threshold) {
        const speedChange = Math.abs(speed - prevSpeed);
        if (speedChange > threshold) {
          collisionIndexes.push(i);
        }
      }
    }

    prevSpeed = speed;
  }

  return collisionIndexes;
}

function countSteps(accelerationData: number[][], threshold: number) {
  let stepCount = 0;
  let prevAcc = null;

  for (let i = 0; i < accelerationData.length; i++) {
    const acc = Math.sqrt(accelerationData[i][0] ** 2 + accelerationData[i][1] ** 2 + accelerationData[i][2] ** 2);
    if (prevAcc !== null) {
      const accDiff = Math.abs(acc - prevAcc);
      if (accDiff > threshold) {
        stepCount++;
      }
    }
    prevAcc = acc;
  }

  return stepCount;
}

export function calculateVelocity(accelerationData: number[][], threshold: number) {
  const velocityData = [0];
  let velocity = 0;
  for (let i = 1; i < accelerationData.length; i++) {
    const deltaT = 1 / 250;
    const deltaV = ((accelerationData[i][0] + accelerationData[i - 1][0]) / 2) * deltaT;
    velocity += deltaV;
    velocityData.push(velocity);
  }
  return velocityData;
}
