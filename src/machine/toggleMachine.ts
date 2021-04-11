import { assign, Machine } from "xstate";

interface ToggleContext {
  count: number;
}

const context: ToggleContext = { count: 0 };

const toggleMachine = Machine<ToggleContext>(
  {
    id: "toggle",
    initial: "inactive",
    context,
    states: {
      inactive: {
        on: {
          TOGGLE: "active",
        },
      },
      active: {
        activities: ["beeping"], // 이 state에 왔을 때 'beeping' activity 실행
        entry: assign({ count: (ctx) => ctx.count + 1 }),
        on: { TOGGLE: "inactive" },
      },
    },
  },
  {
    activities: {
      beeping: () => {
        // 비프 울리기
        const interval = setInterval(() => console.log("BEEP!"), 1000);

        return () => clearInterval(interval);
      },
    },
  }
);

export { toggleMachine };
