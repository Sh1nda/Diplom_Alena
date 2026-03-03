import "./scheduleTable.css";

const PAIRS = [
  { number: 1, start: "08:30", end: "10:05" },
  { number: 2, start: "10:15", end: "11:50" },
  { number: 3, start: "12:10", end: "13:45" },
  { number: 4, start: "14:00", end: "15:35" },
  { number: 5, start: "15:45", end: "17:20" },
  { number: 6, start: "17:30", end: "19:05" },
];

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];

export default function ScheduleTable({ lessons }) {

  // ✅ теперь возвращаем МАССИВ
  const getLessons = (day, pair) =>
    lessons.filter(
      (l) => l.day === day && Number(l.pair_number) === pair
    );

  return (
    <table className="schedule-table">
      <thead>
        <tr>
          <th>Время</th>
          {DAYS.map((d) => (
            <th key={d}>{d}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {PAIRS.map((pair) => (
          <tr key={pair.number}>
            <td className="time-cell">
              <div>{pair.number} пара</div>
              <div>
                {pair.start} – {pair.end}
              </div>
            </td>

            {DAYS.map((day) => {
              const lessonsInCell = getLessons(day, pair.number);

              return (
                <td key={day} className="lesson-cell">
                  {lessonsInCell.map((lesson, i) => (
                    <div key={i} className="lesson-block">
                      <div className="lesson-title">
                        {lesson.title}
                      </div>

                      <div className="lesson-room">
                        {lesson.room}
                      </div>
                    </div>
                  ))}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}