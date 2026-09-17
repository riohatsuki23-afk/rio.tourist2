import travelData from "./data/travel-data.json";

function App() {
  return (
    <div className="app">
      <h1>{travelData.title || "法国旅行计划"}</h1>

      <p>
        {travelData.destination ||
          "France Travel Planner"}
      </p>

      <section>
        <h2>每日行程</h2>

        {travelData.days?.map((day, index) => (
          <div key={index}>
            <h3>
              Day {index + 1}
            </h3>

            <p>
              {day.title || day.location}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;