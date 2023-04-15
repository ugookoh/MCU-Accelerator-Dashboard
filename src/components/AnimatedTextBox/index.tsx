import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";

interface Props {
  title: string;
  value: number;
  unit: JSX.Element;
  noAnimate?: boolean;
}

const AnimatedTextBox = ({ title, value, unit, noAnimate }: Props) => {
  const [count, setCount] = useState(0);
  const duration = 2;
  useEffect(() => {
    if (noAnimate) return;
    setCount(0);
    setTimeout(() => {
      let start = 0;
      // first three numbers from props
      const end = value;
      // if zero, return
      if (start >= end) return;

      let totalMilSecDur = duration;
      let incrementTime = (totalMilSecDur / end) * 1000;

      let timer = setInterval(() => {
        start += 1;
        setCount(start >= end ? end : start);
        if (start >= end) clearInterval(timer);
      }, incrementTime);
    }, 100);
  }, [value]);

  return (
    <div className={styles.container}>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>
        {noAnimate ? value : Number(count.toFixed(3))} {unit}
      </p>
    </div>
  );
};

export default AnimatedTextBox;
