import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  Archive,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Coins,
  Home,
  RotateCcw,
  Settings,
  ShoppingBag,
  Swords,
  UserRound,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { camTaunts, Difficulty, lessons, powerUps, storePool, TopicId } from "./lib/data";
import { generateProblem, generateSet, Problem } from "./lib/problems";
import { useGameState } from "./lib/gameState";

type PowerUpName = (typeof powerUps)[number];

const powerUpGear: Record<PowerUpName, { itemId: string; label: string }> = {
  Hint: { itemId: "hint-token", label: "Hint Lens" },
  "50/50": { itemId: "option-eraser", label: "Option Eraser" },
  "Time Freeze": { itemId: "freeze-card", label: "Freeze Card" },
  "Cam Stumble": { itemId: "stumble-card", label: "Stumble Card" },
  "Double Coins": { itemId: "coin-charm", label: "Coin Charm" },
  Skip: { itemId: "skip-pass", label: "Skip Pass" },
};

function App() {
  const game = useGameState();
  const themeClass = game.state.equippedItems.theme ? `theme-${game.state.equippedItems.theme}` : "";

  return (
    <div className={`app-shell ${themeClass}`}>
      <div className="phone-frame">
        <Header coins={game.state.coins} streak={game.state.streak} level={game.state.level} xp={game.state.xp} />
        <main className="screen">
          <Routes>
            <Route path="/" element={<Hub game={game} />} />
            <Route path="/learn" element={<Learn game={game} />} />
            <Route path="/learn/:lessonId" element={<LessonDetail game={game} />} />
            <Route path="/practice" element={<Practice game={game} />} />
            <Route path="/duel" element={<DuelSetup game={game} />} />
            <Route path="/duel/play" element={<DuelPlay game={game} />} />
            <Route path="/store" element={<Store game={game} />} />
            <Route path="/locker" element={<Locker game={game} />} />
            <Route path="/settings" element={<SettingsScreen game={game} />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

type GameApi = ReturnType<typeof useGameState>;

function Header({ coins, streak, level, xp }: { coins: number; streak: number; level: number; xp: number }) {
  const nextLevelXp = level * 100;
  const levelProgress = Math.min(100, ((xp % 100) / 100) * 100);

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">MathDuel</p>
        <h1>Vedic Math vs Cam</h1>
      </div>
      <div className="wallet" aria-label={`${coins} coins`}>
        <Coins size={18} />
        {coins}
      </div>
      <div className="level-strip">
        <span>Lv {level}</span>
        <div className="xp-track">
          <div className="xp-fill" style={{ width: `${levelProgress}%` }} />
        </div>
        <span>{nextLevelXp - xp > 0 ? nextLevelXp - xp : 100} XP</span>
      </div>
      <div className="streak-pill">Streak {streak}</div>
    </header>
  );
}

function BottomNav() {
  const items = [
    { to: "/", icon: Home, label: "Hub" },
    { to: "/learn", icon: BookOpen, label: "Learn" },
    { to: "/duel", icon: Swords, label: "Duel" },
    { to: "/store", icon: ShoppingBag, label: "Store" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function Hub({ game }: { game: GameApi }) {
  const taunt = camTaunts[new Date().getDate() % camTaunts.length];
  const completed = game.state.completedLessons.length;

  return (
    <section className="stack">
      <div className="hero-panel">
        <div className="versus-badge">VS</div>
        <h2>Beat Cam with shortcut math.</h2>
        <p>{taunt}</p>
        <PlayerPreview game={game} compact />
      </div>

      <div className="stat-grid">
        <Stat label="Lessons" value={`${completed}/${lessons.length}`} />
        <Stat label="Badges" value={String(game.state.badges.length)} />
        <Stat label="Difficulty" value={capitalize(game.state.difficulty)} />
      </div>

      <div className="action-grid">
        <BigAction to="/learn" icon={<BookOpen />} title="Learn" text="Try a 3-minute trick." />
        <BigAction to="/practice" icon={<Zap />} title="Practice" text="Slow drills, no timer." />
        <BigAction to="/duel" icon={<Swords />} title="Duel Cam" text="Five-question race." />
        <BigAction to="/store" icon={<ShoppingBag />} title="Store" text="Buy gear and themes." />
      </div>

      <section className="section-block">
        <h3>Badge Shelf</h3>
        {game.state.badges.length ? (
          <div className="badge-row">
            {game.state.badges.map((badge) => (
              <span className="earned-badge" key={badge}>
                <BadgeCheck size={16} />
                {badge}
              </span>
            ))}
          </div>
        ) : (
          <p className="muted">Finish a lesson check to unlock your first badge.</p>
        )}
      </section>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BigAction({ to, icon, title, text }: { to: string; icon: ReactNode; title: string; text: string }) {
  return (
    <Link to={to} className="big-action">
      <span className="action-icon">{icon}</span>
      <strong>{title}</strong>
      <small>{text}</small>
    </Link>
  );
}

function Learn({ game }: { game: GameApi }) {
  const groups = ["Long Division", "Fractions"] as const;
  return (
    <section className="stack">
      <ScreenTitle title="Learn" text="Pick one trick, watch the steps, then pass a 3-question check." />
      {groups.map((group) => (
        <div className="section-block" key={group}>
          <h3>{group}</h3>
          <div className="lesson-list">
            {lessons
              .filter((lesson) => lesson.category === group)
              .map((lesson) => {
                const done = game.state.completedLessons.includes(lesson.id);
                return (
                  <Link to={`/learn/${lesson.id}`} className="lesson-card" key={lesson.id}>
                    <div>
                      <span className="lesson-meta">{lesson.minutes} · +{lesson.reward} coins</span>
                      <strong>{lesson.title}</strong>
                      <small>{lesson.badge}</small>
                    </div>
                    {done ? <CheckCircle2 className="success-icon" /> : <span className="start-chip">Start</span>}
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </section>
  );
}

function LessonDetail({ game }: { game: GameApi }) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = lessons.find((item) => item.id === lessonId);
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState(() => (lesson ? generateSet(lesson.id, "easy", 3) : []));
  const [answers, setAnswers] = useState<Record<number, string>>({});

  if (!lesson) return <Missing title="Lesson not found" />;

  const exampleStep = step - lesson.demo.length;
  const inExamples = exampleStep >= 0 && exampleStep < lesson.examples.length;
  const checkStarted = step >= lesson.demo.length + lesson.examples.length;
  const correct = questions.filter((problem, index) => answers[index] === problem.answer).length;
  const complete = Object.keys(answers).length === questions.length && correct >= 2;
  const allAnswered = Object.keys(answers).length === questions.length;

  const finish = () => {
    game.completeLesson(lesson.id);
    navigate("/practice", { state: { topic: lesson.id } });
  };

  const retryCheck = () => {
    setQuestions(generateSet(lesson.id, "easy", 3));
    setAnswers({});
  };

  return (
    <section className="stack">
      <ScreenTitle title={lesson.title} text={lesson.guidedExample} />
      {!checkStarted && !inExamples ? (
        <div className="demo-stage">
          <div className="step-orbit">{step + 1}</div>
          <h3>{lesson.demo[step]}</h3>
          <div className="progress-dots">
            {[...lesson.demo, ...lesson.examples].map((_, index) => (
              <span key={index} className={index <= step ? "dot active" : "dot"} />
            ))}
          </div>
          <button className="primary-button" onClick={() => setStep(step + 1)}>
            Next Step
          </button>
        </div>
      ) : inExamples ? (
        <ExampleCard
          title={lesson.examples[exampleStep].title}
          problem={lesson.examples[exampleStep].problem}
          steps={lesson.examples[exampleStep].steps}
          index={exampleStep}
          total={lesson.examples.length}
          onNext={() => setStep(step + 1)}
        />
      ) : (
        <QuestionSet problems={questions} answers={answers} setAnswers={setAnswers} />
      )}
      {checkStarted && (
        <div className="result-panel">
          <strong>{correct}/3 correct</strong>
          <p>{complete ? `Badge unlocked: ${lesson.badge}` : allAnswered ? "Review the explanations, then try a fresh set." : "Pick an answer for each question. The explanation appears right away."}</p>
          {complete ? (
            <button className="primary-button" onClick={finish}>
              Claim +{lesson.reward} Coins
            </button>
          ) : (
            <button className="secondary-button" disabled={!allAnswered} onClick={retryCheck}>
              Try Again
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function Practice({ game }: { game: GameApi }) {
  const firstTopic = (game.state.completedLessons[game.state.completedLessons.length - 1] as TopicId) || lessons[0].id;
  const [topic, setTopic] = useState<TopicId>(firstTopic);
  const [problem, setProblem] = useState(() => generateProblem(topic, game.state.difficulty));
  const [picked, setPicked] = useState("");
  const [streak, setStreak] = useState(0);

  const next = () => {
    setPicked("");
    setProblem(generateProblem(topic, game.state.difficulty));
  };

  const answer = (choice: string) => {
    setPicked(choice);
    if (choice === problem.answer) {
      setStreak((value) => value + 1);
      game.award(4, 5);
    } else {
      setStreak(0);
    }
  };

  return (
    <section className="stack">
      <ScreenTitle title="Practice" text="Untimed reps. Accuracy first, speed later." />
      <TopicPicker topic={topic} setTopic={(nextTopic) => {
        setTopic(nextTopic);
        setProblem(generateProblem(nextTopic, game.state.difficulty));
        setPicked("");
      }} />
      <ProblemCard problem={problem} picked={picked} onPick={answer} />
      <div className="result-panel">
        <strong>Practice streak: {streak}</strong>
        <p>
          {picked
            ? picked === problem.answer
              ? `Nice. ${problem.explanation} +4 coins and +5 XP.`
              : `Not quite. ${problem.explanation}`
            : problem.hint}
        </p>
        <button className="secondary-button" onClick={next}>Next Drill</button>
      </div>
    </section>
  );
}

function DuelSetup({ game }: { game: GameApi }) {
  const [topic, setTopic] = useState<TopicId>(lessons[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>(game.state.difficulty);

  return (
    <section className="stack">
      <ScreenTitle title="Duel Cam" text="Five questions. Spin a power-up before each one." />
      <TopicPicker topic={topic} setTopic={setTopic} />
      <Segmented value={difficulty} setValue={setDifficulty} options={["easy", "medium", "hard"]} />
      <Link to={`/duel/play?topic=${topic}&difficulty=${difficulty}`} className="primary-button link-button">
        Start Race
      </Link>
      <div className="cam-card">
        <span>Cam says</span>
        <strong>{camTaunts[(new Date().getDate() + 1) % camTaunts.length]}</strong>
      </div>
    </section>
  );
}

function DuelPlay({ game }: { game: GameApi }) {
  const query = new URLSearchParams(window.location.search);
  const topic = (query.get("topic") as TopicId) || lessons[0].id;
  const difficulty = (query.get("difficulty") as Difficulty) || game.state.difficulty;
  const navigate = useNavigate();
  const [problems] = useState(() => generateSet(topic, difficulty, 5));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState("");
  const [playerScore, setPlayerScore] = useState(0);
  const [camScore, setCamScore] = useState(0);
  const [camProgress, setCamProgress] = useState(0);
  const [powerUp, setPowerUp] = useState<string | null>(null);
  const [powerUpMessage, setPowerUpMessage] = useState("");
  const [hiddenChoices, setHiddenChoices] = useState<string[]>([]);
  const [camDurationMs, setCamDurationMs] = useState(0);
  const [camEndsAt, setCamEndsAt] = useState(0);
  const [camEffect, setCamEffect] = useState<"" | "freeze" | "stumble">("");
  const [doubleCoinsActive, setDoubleCoinsActive] = useState(false);
  const [rerolled, setRerolled] = useState(false);
  const [finished, setFinished] = useState(false);
  const [roundWinner, setRoundWinner] = useState<"" | "player" | "cam">("");
  const camAwardedRef = useRef(false);

  const band = difficulty === "hard" ? [3.5, 5.5] : difficulty === "medium" ? [5, 7.5] : [7, 10];
  const baseCamTargetMs = useMemo(() => {
    const seconds = Math.random() * (band[1] - band[0]) + band[0];
    const stumble = difficulty === "hard" && Math.random() < 0.25 ? 3500 : 0;
    return seconds * 1000 + stumble;
  }, [index, difficulty]);
  const enabledPowerUps = powerUps.filter((item) => game.state.ownedItems.includes(powerUpGear[item].itemId));
  const canReroll = game.state.ownedItems.includes("extra-spin") && powerUp && !rerolled && !roundWinner;

  useEffect(() => {
    setCamProgress(0);
    setCamDurationMs(baseCamTargetMs);
    setCamEndsAt(performance.now() + baseCamTargetMs);
  }, [baseCamTargetMs, index]);

  useEffect(() => {
    if (finished || roundWinner || !camEndsAt || !camDurationMs) return;
    let frame = 0;

    const tick = (now: number) => {
      const remainingMs = Math.max(0, camEndsAt - now);
      const progress = Math.min(100, Math.max(0, 100 - (remainingMs / camDurationMs) * 100));
      setCamProgress(progress);
      if (progress >= 100) {
        if (!camAwardedRef.current) {
          camAwardedRef.current = true;
          setCamScore((score) => score + 1);
          setRoundWinner("cam");
        }
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [camEndsAt, camDurationMs, finished, roundWinner]);

  const problem = problems[index];
  const applyPowerUp = (nextPowerUp: string) => {
    setPowerUp(nextPowerUp);
    if (nextPowerUp === "Hint") {
      setPowerUpMessage(problem.hint);
    }
    if (nextPowerUp === "50/50") {
      const wrong = problem.choices.filter((choice) => choice !== problem.answer);
      setHiddenChoices(wrong.slice(0, 2));
      setPowerUpMessage("Two wrong choices erased.");
    }
    if (nextPowerUp === "Time Freeze") {
      setCamDurationMs((value) => value + 3500);
      setCamEndsAt((value) => value + 3500);
      setCamEffect("freeze");
      window.setTimeout(() => setCamEffect(""), 900);
      setPowerUpMessage("Cam paused +3.5s.");
    }
    if (nextPowerUp === "Cam Stumble") {
      setCamDurationMs((value) => value + 5000);
      setCamEndsAt((value) => value + 5000);
      setCamEffect("stumble");
      window.setTimeout(() => setCamEffect(""), 900);
      setPowerUpMessage("Cam slowed +5s.");
    }
    if (nextPowerUp === "Double Coins") {
      setDoubleCoinsActive(true);
      setPowerUpMessage("Duel reward x2 is armed.");
    }
    if (nextPowerUp === "Skip") {
      setPicked(problem.answer);
      setPlayerScore((score) => score + 1);
      setRoundWinner("player");
      setPowerUpMessage("Skipped cleanly. Point to you.");
    }
  };
  const spin = () => {
    if (!enabledPowerUps.length) return;
    applyPowerUp(enabledPowerUps[Math.floor(Math.random() * enabledPowerUps.length)]);
  };
  const rerollPowerUp = () => {
    if (!enabledPowerUps.length) return;
    setRerolled(true);
    setPowerUpMessage("");
    setHiddenChoices([]);
    applyPowerUp(enabledPowerUps[Math.floor(Math.random() * enabledPowerUps.length)]);
  };
  const pick = (choice: string) => {
    if (roundWinner) return;
    setPicked(choice);
    if (choice === problem.answer) {
      setRoundWinner("player");
      setPlayerScore((score) => score + 1);
    } else {
      setRoundWinner("cam");
      setCamScore((score) => score + 1);
      setPowerUpMessage(`Cam gets this one. The answer was ${problem.answer}.`);
    }
  };
  const next = () => {
    if (index === problems.length - 1) {
      const won = playerScore >= camScore;
      const base = difficulty === "hard" ? 80 : difficulty === "medium" ? 55 : 35;
      const coins = won ? base + playerScore * 5 : 12;
      game.award(doubleCoinsActive ? coins * 2 : coins, won ? 60 : 20);
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setPicked("");
    setRoundWinner("");
    camAwardedRef.current = false;
    setPowerUp(null);
    setPowerUpMessage("");
    setHiddenChoices([]);
    setRerolled(false);
    setCamProgress(0);
  };

  if (finished) {
    const won = playerScore >= camScore;
    return (
      <section className="stack">
        <div className="finish-panel">
          <h2>{won ? "You beat Cam!" : "Cam got this round."}</h2>
          <p>{playerScore} to {camScore}. Coins and XP were added.</p>
          <button className="primary-button" onClick={() => navigate("/duel")}>Race Again</button>
          <Link to="/" className="secondary-button link-button">Back to Hub</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="stack duel-stack">
      <div className="duel-score">
        <strong>You {playerScore}</strong>
        <span>Q{index + 1}/5</span>
        <strong>Cam {camScore}</strong>
      </div>
      <button className="spinner-button" onClick={spin} disabled={Boolean(powerUp) || !enabledPowerUps.length}>
        <RotateCcw size={20} />
        {powerUp || (enabledPowerUps.length ? "Spin Power-Up" : "Buy Power-Up Gear")}
      </button>
      {canReroll && (
        <button className="secondary-button" onClick={rerollPowerUp}>
          Extra Spin
        </button>
      )}
      <div className="powerup-panel">
        <strong>{powerUp ? `${powerUp} active` : "Power-up gear"}</strong>
        <p>
          {powerUpMessage ||
            (enabledPowerUps.length
              ? enabledPowerUps.map((item) => powerUpGear[item].label).join(" · ")
              : "Locked. Buy power-up gear in the Store before these can appear in duels.")}
        </p>
        {!enabledPowerUps.length && (
          <Link to="/store" className="powerup-link">
            Go to Store
          </Link>
        )}
      </div>
      <PlayerPreview game={game} compact />
      <div className={`cam-progress ${camEffect}`}>
        <span>{roundWinner === "cam" ? "Cam solved it" : roundWinner === "player" ? "Answer locked" : "Cam thinking"}</span>
        <div><b style={{ width: `${camProgress}%` }} /></div>
      </div>
      <ProblemCard problem={problem} picked={picked || (roundWinner === "cam" ? "__cam__" : "")} hiddenChoices={hiddenChoices} onPick={pick} />
      <button className="primary-button" disabled={!roundWinner} onClick={next}>
        {index === problems.length - 1 ? "Finish Duel" : "Next Question"}
      </button>
    </section>
  );
}

function Store({ game }: { game: GameApi }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      game.refreshStoreIfNeeded();
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [game]);

  const remaining = Math.max(0, game.state.nextStoreRefreshAt - now);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, "0");

  return (
    <section className="stack">
      <ScreenTitle title="Store" text={`Refresh in ${minutes}:${seconds}`} />
      <Link to="/locker" className="secondary-button link-button">
        <Archive size={18} />
        Open Locker
      </Link>
      <div className="store-grid">
        {game.storeItems.map((item) => {
          const owned = game.state.ownedItems.includes(item.id);
          return (
            <button className={`store-item ${item.rarity}`} key={item.id} onClick={() => game.buyItem(item.id, item.price)} disabled={owned}>
              <span>{item.type}</span>
              <strong>{item.name}</strong>
              <small>{owned ? "In locker" : `${item.price} coins`}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Locker({ game }: { game: GameApi }) {
  const ownedItems = storePool.filter((item) => game.state.ownedItems.includes(item.id));
  const shelves = ["Hat", "Avatar", "Theme", "Taunts", "Power-up"] as const;

  return (
    <section className="stack">
      <ScreenTitle title="Locker" text="Equip what you bought. Power-ups stay saved for a later duel upgrade." />
      <PlayerPreview game={game} />
      {ownedItems.length === 0 ? (
        <div className="empty-locker">
          <Archive size={28} />
          <strong>Your shelves are ready.</strong>
          <p>Buy something from the store and it will show up here.</p>
          <Link to="/store" className="primary-button link-button">Visit Store</Link>
        </div>
      ) : (
        shelves.map((shelf) => {
          const items = ownedItems.filter((item) => item.type === shelf);
          if (!items.length) return null;
          return (
            <div className="locker-shelf" key={shelf}>
              <div className="shelf-title">
                <span>{shelf}</span>
                <b>{items.length}</b>
              </div>
              <div className="shelf-items">
                {items.map((item) => {
                  const slot = item.type === "Hat" ? "hat" : item.type === "Theme" ? "theme" : item.type === "Taunts" ? "taunts" : item.type === "Avatar" ? "avatar" : "";
                  const equipped = slot && game.state.equippedItems[slot] === item.id;
                  const equippable = item.type !== "Power-up";
                  return (
                    <div className={`locker-item ${item.rarity}`} key={item.id}>
                      <ItemGlyph itemId={item.id} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{equipped ? "Equipped" : equippable ? "Ready" : "Unlocks in duels"}</span>
                      </div>
                      {equippable && (
                        <button className={equipped ? "equipped-button" : "equip-button"} onClick={() => game.equipItem(item.id)}>
                          {equipped ? "On" : "Equip"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}

function SettingsScreen({ game }: { game: GameApi }) {
  return (
    <section className="stack">
      <ScreenTitle title="Settings" text="Tune the race without changing your lesson progress." />
      <div className="section-block">
        <h3>Difficulty</h3>
        <Segmented value={game.state.difficulty} setValue={(difficulty) => game.update({ difficulty })} options={["easy", "medium", "hard"]} />
      </div>
      <div className="setting-row">
        <div>
          <strong>Sound</strong>
          <span>{game.state.sound ? "On" : "Off"}</span>
        </div>
        <button className="icon-button" onClick={() => game.update({ sound: !game.state.sound })} aria-label="Toggle sound">
          {game.state.sound ? <Volume2 /> : <VolumeX />}
        </button>
      </div>
      <button className="danger-button" onClick={game.reset}>Reset Progress</button>
    </section>
  );
}

function TopicPicker({ topic, setTopic }: { topic: TopicId; setTopic: (topic: TopicId) => void }) {
  return (
    <label className="field">
      <span>Topic</span>
      <select value={topic} onChange={(event) => setTopic(event.target.value as TopicId)}>
        {lessons.map((lesson) => (
          <option value={lesson.id} key={lesson.id}>
            {lesson.shortTitle} · {lesson.category}
          </option>
        ))}
      </select>
    </label>
  );
}

function PlayerPreview({ game, compact = false }: { game: GameApi; compact?: boolean }) {
  const { hat, avatar, theme } = game.state.equippedItems;
  const hatItem = storePool.find((item) => item.id === hat);
  const avatarItem = storePool.find((item) => item.id === avatar);
  const themeItem = storePool.find((item) => item.id === theme);

  return (
    <div className={compact ? "player-preview compact" : "player-preview"}>
      <div className={`player-avatar ${avatar || ""}`}>
        {hat && <span className={`avatar-hat ${hat}`} />}
        <UserRound size={compact ? 28 : 38} />
      </div>
      <div>
        <span>Your Look</span>
        <strong>{[hatItem?.name, avatarItem?.name, themeItem?.name].filter(Boolean).join(" · ") || "Classic Kit"}</strong>
      </div>
    </div>
  );
}

function ItemGlyph({ itemId }: { itemId: string }) {
  return (
    <span className={`item-glyph ${itemId}`}>
      <ShoppingBag size={18} />
    </span>
  );
}

function QuestionSet({
  problems,
  answers,
  setAnswers,
}: {
  problems: Problem[];
  answers: Record<number, string>;
  setAnswers: (answers: Record<number, string>) => void;
}) {
  return (
    <div className="question-set">
      {problems.map((problem, index) => (
        <ProblemCard
          key={`${problem.prompt}-${index}`}
          problem={problem}
          picked={answers[index]}
          onPick={(choice) => setAnswers({ ...answers, [index]: choice })}
        />
      ))}
    </div>
  );
}

function ExampleCard({
  title,
  problem,
  steps,
  index,
  total,
  onNext,
}: {
  title: string;
  problem: string;
  steps: string[];
  index: number;
  total: number;
  onNext: () => void;
}) {
  return (
    <div className="example-card">
      <div className="example-header">
        <span className="lesson-meta">Example {index + 1}/{total}</span>
        <strong>{title}</strong>
      </div>
      <div className="example-problem">{problem}</div>
      <ol>
        {steps.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <button className="primary-button" onClick={onNext}>
        {index === total - 1 ? "Try Check" : "Next Example"}
      </button>
    </div>
  );
}

function ProblemCard({
  problem,
  picked,
  hiddenChoices = [],
  onPick,
}: {
  problem: Problem;
  picked: string;
  hiddenChoices?: string[];
  onPick: (choice: string) => void;
}) {
  return (
    <div className="problem-card">
      <span className="lesson-meta">Solve</span>
      <strong>{problem.prompt}</strong>
      <div className="choice-grid">
        {problem.choices.map((choice) => {
          const isPicked = picked === choice;
          const isCorrect = picked && choice === problem.answer;
          const hidden = hiddenChoices.includes(choice);
          return (
            <button
              key={choice}
              className={`choice-button ${isPicked ? "picked" : ""} ${isCorrect ? "correct" : ""} ${hidden ? "removed" : ""}`}
              onClick={() => onPick(choice)}
              disabled={Boolean(picked) || hidden}
            >
              {hidden ? "—" : choice}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className={picked === problem.answer ? "answer-feedback correct" : "answer-feedback"}>
          <strong>{picked === problem.answer ? "Correct" : `Answer: ${problem.answer}`}</strong>
          <p>{problem.explanation}</p>
        </div>
      )}
    </div>
  );
}

function Segmented<T extends string>({ value, setValue, options }: { value: T; setValue: (value: T) => void; options: T[] }) {
  return (
    <div className="segmented">
      {options.map((option) => (
        <button key={option} className={value === option ? "selected" : ""} onClick={() => setValue(option)}>
          {capitalize(option)}
        </button>
      ))}
    </div>
  );
}

function ScreenTitle({ title, text }: { title: string; text: string }) {
  return (
    <div className="screen-title">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function Missing({ title }: { title: string }) {
  return (
    <section className="stack">
      <ScreenTitle title={title} text="That page is not available yet." />
      <Link to="/" className="primary-button link-button">Back Home</Link>
    </section>
  );
}

const capitalize = (value: string) => value.slice(0, 1).toUpperCase() + value.slice(1);

export default App;
