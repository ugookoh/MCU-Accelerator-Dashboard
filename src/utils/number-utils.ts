import Papa from "papaparse";

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
  const calculations: { [key: string]: number } = {
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

    calculations.max_x_acceleration = Math.max(calculations.max_x_acceleration, x_acc);
    calculations.max_y_acceleration = Math.max(calculations.max_y_acceleration, y_acc);
    calculations.max_z_acceleration = Math.max(calculations.max_z_acceleration, z_acc);

    const x_gro = Number(data[i][3]);
    const y_gro = Number(data[i][4]);
    const z_gro = Number(data[i][5]);

    calculations.max_x_rotation = Math.max(calculations.max_x_rotation, x_gro);
    calculations.max_y_rotation = Math.max(calculations.max_y_rotation, y_gro);
    calculations.max_z_rotation = Math.max(calculations.max_z_rotation, z_gro);
  }

  return calculations;
};
