import { useEffect, useState } from "react";
import travelData from "./data/travel-data.json";
import "./styles/app.css";

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);

  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    })
    .toUpperCase();
}

function Countdown({ targetDate }) {
  const calculate = () => {
    const diff = new Date(targetDate).getTime() - Date.now();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [time, setTime] = useState(calculate());

  useEffect(() => {
    const timer = setInterval(() => setTime(calculate()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <section className="countdown">
      <div>
        <div className="section-label light-label">DEPARTURE IN</div>

        <div className="countdown-main">
          <strong>{String(time.days).padStart(2, "0")}</strong>
          <span>DAYS</span>
        </div>
      </div>

      <div className="countdown-clock">
        {String(time.hours).padStart(2, "0")}:
        {String(time.minutes).padStart(2, "0")}:
        {String(time.seconds).padStart(2, "0")}
      </div>
    </section>
  );
}

function FlightCard({ flight, index, total }) {
  const dep = flight.departure;
  const arr = flight.arrival;

  return (
    <article className="flight-card">
      <div className="flight-top">
        <div>
          <strong>{flight.airline}</strong>

          {flight.operated_by &&
            flight.operated_by !== flight.airline && (
              <small>OPERATED BY {flight.operated_by.toUpperCase()}</small>
            )}
        </div>

        <strong>{flight.flight}</strong>
      </div>

      <div className="flight-route">
        <div>
          <strong className="airport-code">{dep.airport}</strong>
          <span>{dep.city}</span>
          <time>{dep.time || "--:--"}</time>
        </div>

        <div className="flight-path">
          <i />
          <span>✈</span>
          <i />
        </div>

        <div className="flight-destination">
          <strong className="airport-code">{arr.airport}</strong>
          <span>{arr.city}</span>
          <time>{arr.time || "--:--"}</time>
        </div>
      </div>

      <div className="flight-bottom">
        <div>
          {formatDate(dep.date)}
          {dep.terminal && <b>T{dep.terminal}</b>}
        </div>

        <span>
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>

        <div className="flight-bottom-right">
          {formatDate(arr.date)}
          {arr.terminal && <b>T{arr.terminal}</b>}
        </div>
      </div>
    </article>
  );
}

function FlightGroup({ label, title, flights }) {
  return (
    <div className="flight-group">
      <div className="group-heading">
        <div>
          <div className="section-label">{label}</div>
          <h3>{title}</h3>
        </div>

        <span>SWIPE →</span>
      </div>

      <div className="horizontal-scroll">
        {flights.map((flight, index) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            index={index}
            total={flights.length}
          />
        ))}
      </div>
    </div>
  );
}

function FlightSection() {
  const outbound = travelData.flights.filter(
    (flight) => flight.direction === "outbound"
  );

  const returning = travelData.flights.filter(
    (flight) => flight.direction === "return"
  );

  return (
    <section id="flights" className="content-section">
      <SectionHeading number="01" label="FLIGHT" title="航班行程" />

      <FlightGroup
        label="OUTBOUND"
        title="香港 → 巴黎"
        flights={outbound}
      />

      <FlightGroup
        label="RETURN"
        title="巴黎 → 香港"
        flights={returning}
      />
    </section>
  );
}

function SectionHeading({ number, label, title }) {
  return (
    <div className="main-heading">
      <div className="heading-number">{number}</div>

      <div>
        <div className="section-label">{label}</div>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function JourneySection() {
  const [openDay, setOpenDay] = useState(null);

  return (
    <section id="journey" className="content-section journey-section">
      <SectionHeading number="02" label="JOURNEY" title="法国 · 10日" />

      <div className="journey-list">
        {travelData.days.map((day) => {
          const isOpen = openDay === day.day;

          return (
            <article
              className={`day ${isOpen ? "day-open" : ""}`}
              key={day.day}
            >
              <button
                className="day-button"
                onClick={() => setOpenDay(isOpen ? null : day.day)}
              >
                <div className="day-index">
                  <span>DAY</span>
                  <strong>{String(day.day).padStart(2, "0")}</strong>
                </div>

                <div className="day-copy">
                  <time>{formatDate(day.date)}</time>
                  <h3>{day.title}</h3>

                  {day.route && <p>{day.route}</p>}
                </div>

                <span className="day-toggle">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="day-detail">
                  {day.timeline?.length > 0 ? (
                    day.timeline.map((item, index) => (
                      <div className="timeline-row" key={index}>
                        <div className="timeline-axis">
                          <span />
                        </div>

                        <div className="timeline-copy">
                          {item.time && <time>{item.time}</time>}

                          <h4>{item.title}</h4>

                          {item.location && <p>{item.location}</p>}

                          {item.google_map && (
                            <a
                              href={item.google_map}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              GOOGLE MAPS ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      详细行程待补充
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StaySection() {
  return (
    <section id="stay" className="content-section">
      <SectionHeading number="03" label="STAY" title="住宿" />

      <div className="stay-list">
        {travelData.hotels.map((hotel, index) => (
          <article className="stay-card" key={index}>
            <div className="stay-number">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="stay-copy">
              <span>{hotel.period}</span>

              <h3>
                {hotel.name ||
                  `${hotel.city || "Paris"} · Hotel`}
              </h3>

              {hotel.city && <p>{hotel.city}</p>}

              {hotel.address && (
                <address>{hotel.address}</address>
              )}

              {hotel.google_map && (
                <a
                  href={hotel.google_map}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GOOGLE MAPS ↗
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RoadSection() {
  const rental = travelData.transport?.car_rental;
  const tips = travelData.transport?.france_driving_tips || [];

  if (!rental?.enabled) return null;

  return (
    <section id="road" className="content-section road-section">
      <SectionHeading number="04" label="ON THE ROAD" title="法国自驾" />

      <article className="rental-card">
        <div>
          <span>PICK UP</span>
          <strong>{formatDate(rental.pickup.date)}</strong>
          <time>{rental.pickup.time}</time>
          <p>{rental.pickup.location}</p>
        </div>

        <div className="rental-arrow">→</div>

        <div className="rental-return">
          <span>RETURN</span>
          <strong>{formatDate(rental.dropoff.date)}</strong>
          <time>{rental.dropoff.time}</time>
          <p>{rental.dropoff.location}</p>
        </div>
      </article>

      <div className="road-tips">
        {tips.map((tip, index) => (
          <details key={index}>
            <summary>
              <span>
                {String(index + 1).padStart(2, "0")}
              </span>

              <strong>{tip.title}</strong>

              <b>+</b>
            </summary>

            <p>{tip.content}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function BottomNavigation() {
  return (
    <nav className="bottom-navigation">
      <a href="#journey">
        <span>02</span>
        <strong>行程</strong>
      </a>

      <a href="#flights">
        <span>01</span>
        <strong>航班</strong>
      </a>

      <a href="#stay">
        <span>03</span>
        <strong>住宿</strong>
      </a>

      <a href="#road">
        <span>04</span>
        <strong>自驾</strong>
      </a>
    </nav>
  );
}

function App() {
  const { trip, countdown } = travelData;

  return (
    <main className="page">
      <div className="travel-app">
        <header className="hero">
          <div className="hero-top">
            <span>RIO · TRAVEL</span>
            <span>FR / 2026</span>
          </div>

          <div className="hero-content">
            <div className="hero-kicker">FRANCE · 2026</div>

            <h1>{trip.title}</h1>

            <p>{trip.subtitle}</p>
          </div>

          <div className="trip-meta">
            <div>
              <span>FROM</span>
              <strong>{formatDate(trip.date_start)}</strong>
            </div>

            <div>
              <span>TO</span>
              <strong>{formatDate(trip.date_end)}</strong>
            </div>

            <div>
              <span>DURATION</span>
              <strong>{trip.duration_days} DAYS</strong>
            </div>
          </div>
        </header>

        {countdown?.enabled && (
          <Countdown targetDate={countdown.target_date} />
        )}

        <FlightSection />
        <JourneySection />
        <StaySection />
        <RoadSection />
      </div>

      <BottomNavigation />
    </main>
  );
}

export default App;