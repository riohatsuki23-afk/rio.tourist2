import { useEffect, useState } from "react";
import travelData from "./data/travel-data.json";
import day05RouteMap from "./assets/maps/day-05-route.png";
import day06RouteMap from "./assets/maps/day-06-route.png";
import day07RouteMap from "./assets/maps/day-07-route.png";
import day08RouteMap from "./assets/maps/day-08-route.png";
import day09RouteMap from "./assets/maps/day-09-route.png";
import "./styles/app.css";

const routeMaps = {
  "day-05-route": day05RouteMap,
  "day-06-route": day06RouteMap,
  "day-07-route": day07RouteMap,
  "day-08-route": day08RouteMap,
  "day-09-route": day09RouteMap,
};

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

const PARIS_TIME_ZONE = "Europe/Paris";

const DEV_PREVIEW = {
  enabled:false,
  date: "2026-10-02",
  time: "19:31",
};

function getParisNow() {
  if (DEV_PREVIEW.enabled) {
    const [hour, minute] = DEV_PREVIEW.time.split(":").map(Number);

    return {
      date: DEV_PREVIEW.date,
      time: DEV_PREVIEW.time,
      hour,
      minute,
    };
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

function timeToMinutes(timeString) {
  if (!timeString) return null;

  const match = timeString.match(/(\d{1,2}):(\d{2})/);

  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}

function getTripStatus() {
  const paris = getParisNow();
  const start = travelData.trip.date_start;
  const end = travelData.trip.date_end;

  if (paris.date < start) {
    return {
      phase: "upcoming",
      paris,
      today: null,
    };
  }

  if (paris.date > end) {
    return {
      phase: "completed",
      paris,
      today: null,
    };
  }

  const today = travelData.days.find(
    (day) => day.date === paris.date
  );

  return {
    phase: "traveling",
    paris,
    today: today || null,
  };
}

function getMinutesUntil(entry, parisTime) {
  if (!entry || entry.minutes === null) return null;

  const nowMinutes =
    parisTime.hour * 60 + parisTime.minute;

  return Math.max(0, entry.minutes - nowMinutes);
}

function formatMinutesUntil(minutes) {
  if (minutes === null) return "";

  if (minutes < 1) {
    return "NOW";
  }

  if (minutes < 60) {
    return `IN ${minutes} MIN`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `IN ${hours} HR`;
  }

  return `IN ${hours} HR ${remainingMinutes} MIN`;
}

function getDayProgress(day, parisTime) {
  if (!day?.timeline?.length) {
    return {
      current: null,
      next: null,
    };
  }

  const nowMinutes =
    parisTime.hour * 60 + parisTime.minute;

  const timedItems = day.timeline
    .map((item, index) => ({
      item,
      index,
      minutes: timeToMinutes(item.time),
    }))
    .filter((entry) => entry.minutes !== null);

  if (!timedItems.length) {
    return {
      current: null,
      next: null,
    };
  }

  let current = null;
  let next = null;

  for (const entry of timedItems) {
    if (entry.minutes <= nowMinutes) {
      current = entry;
    }

    if (entry.minutes > nowMinutes) {
      next = entry;
      break;
    }
  }

const completed = current
  ? timedItems.filter((entry) => entry.minutes < current.minutes).length
  : 0;

return {
  current,
  next,
  completed,
  total: timedItems.length,
};
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

function DayRouteMap({ day }) {
  if (!day.map) return null;

  const mapImage = routeMaps[day.map.image];

  if (!mapImage) return null;

  return (
    <div className="day-route-map">
      <div className="route-map-heading">
        <div>
          <span>DAY ROUTE</span>
          <strong>{day.map.label}</strong>
        </div>

        <time>{formatDate(day.date)}</time>
      </div>

      <div className="route-map-image-frame">
        <img
          className="route-map-image"
          src={mapImage}
          alt={`${day.title} route map`}
        />
      </div>
    </div>
  );
}

function JourneySection() {
  const tripStatus = getTripStatus();
  const today = tripStatus.today;

  const progress =
    tripStatus.phase === "traveling" && today
      ? getDayProgress(today, tripStatus.paris)
      : { current: null, next: null };

  const minutesUntilNext =
    progress.next && tripStatus.phase === "traveling"
      ? getMinutesUntil(progress.next, tripStatus.paris)
      : null;

  const nextCountdown =
    minutesUntilNext !== null
      ? formatMinutesUntil(minutesUntilNext)
      : "";

  const nextIsImportant =
    progress.next &&
    (progress.next.item.reservation === true ||
      progress.next.item.priority === "fixed");

  const nextIsImminent =
    nextIsImportant &&
    minutesUntilNext !== null &&
    minutesUntilNext > 0 &&
    minutesUntilNext <= 30;

  const [openDay, setOpenDay] = useState(
    today ? today.day : null
  );
  return (
    <section id="journey" className="content-section journey-section">
      <SectionHeading number="02" label="JOURNEY" title="法国 · 10日" />
{tripStatus.phase === "traveling" && today && (
  <div className="today-panel">
    <div className="today-panel-top">
      <div>
        <span className="today-label">TODAY</span>
        <strong>
          DAY {String(today.day).padStart(2, "0")}
        </strong>
      </div>

      <time>{formatDate(today.date)}</time>
    </div>

    <h3>{today.title}</h3>

{progress.total > 0 && (
  <div className="today-progress">
    <div className="today-progress-meta">
      <span>TODAY PROGRESS</span>
      <strong>
        {progress.completed} / {progress.total} COMPLETED
      </strong>
    </div>

    <div className="today-progress-track">
      <div
        className="today-progress-fill"
        style={{
          width: `${(progress.completed / progress.total) * 100}%`,
        }}
      />
    </div>
  </div>
)}

    {nextIsImminent && (
      <div className="imminent-alert">
        <span>UPCOMING</span>
        <strong>预约行程即将开始 · 请准备出发</strong>
      </div>
    )}

    {progress.current && (
      <div className="live-item now-item">
        <span>NOW</span>

        <div>
          <time>{progress.current.item.time}</time>
          <strong>{progress.current.item.title}</strong>
        </div>
      </div>
    )}

{progress.next && (
  <div className="live-item next-item">
    <span>NEXT</span>

    <div>
      <div className="next-time-row">
        <time>{progress.next.item.time}</time>

        {nextCountdown && (
          <span className="next-countdown">
            {nextCountdown}
          </span>
        )}
      </div>

      <strong>{progress.next.item.title}</strong>

      {progress.next.item.google_map && (
        <a
          className="live-navigate-button"
          href={progress.next.item.google_map}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>NAVIGATE</span>
          <strong>导航 →</strong>
        </a>
      )}

      {(progress.next.item.reservation === true ||
        progress.next.item.priority === "fixed") && (
        <div className="live-status-row">
          {progress.next.item.reservation === true && (
            <span className="live-status reserved">
              RESERVED · 已预约
            </span>
          )}

          {progress.next.item.reservation !== true &&
            progress.next.item.priority === "fixed" && (
              <span className="live-status fixed">
                FIXED · 固定时间
              </span>
            )}
           </div>
      )}
    </div>
  </div>
)}

  </div>
)}

<div className="journey-list">
        {travelData.days.map((day) => {
          const isOpen = openDay === day.day;
  const isToday =
    tripStatus.phase === "traveling" &&
    today?.day === day.day;
          return (
            <article
              className={`day ${isOpen ? "day-open" : ""} ${
  isToday ? "day-today" : ""
}`}
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
    <DayRouteMap day={day} />

    {day.timeline?.length > 0 ? (
                  day.timeline.map((item, index) => {
  const isReserved = item.reservation === true;
  const isFixed = item.priority === "fixed";
  const isImportant = isReserved || isFixed;

  return (
    <div
      className={`timeline-row ${
        isImportant ? "timeline-important" : ""
      }`}
      key={index}
    >
      <div className="timeline-axis">
        <span />
      </div>

      <div className="timeline-copy">
        <div className="timeline-meta">
          {item.time && <time>{item.time}</time>}

          {isReserved && (
            <span className="status-badge reserved-badge">
              RESERVED · 已预约
            </span>
          )}

          {!isReserved && isFixed && (
            <span className="status-badge fixed-badge">
              FIXED · 固定时间
            </span>
          )}
        </div>

        <h4>{item.title}</h4>

        {item.location && (
          <p className="timeline-location">
            {item.location}
          </p>
        )}

        {item.notes && (
          <p className="timeline-note">
            {item.notes}
          </p>
        )}

        {item.google_map && (
          <a
            className="navigate-button"
            href={item.google_map}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>NAVIGATE</span>
            <strong>导航 →</strong>
          </a>
        )}
      </div>
    </div>
  );
})
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