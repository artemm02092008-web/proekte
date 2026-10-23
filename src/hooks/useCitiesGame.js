import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { RUSSIAN_CITIES } from "../constants/russianCities"; // <-- ИМПОРТ БАЗЫ ГОРОДОВ
import { db } from "../firebase/config";

export const useCitiesGame = (
  chatId,
  currentUserId,
  currentName,
  sendBotMessage
) => {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!chatId) return;
    const gameDoc = doc(db, "games", chatId);

    const unsub = onSnapshot(gameDoc, (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data());
      } else {
        setGameState(null);
      }
    });
    return () => unsub();
  }, [chatId]);

  const handleGameMessage = async (text) => {
    const cleanText = text.trim();
    const lowerText = cleanText.toLowerCase();

    // СТАРТ ИГРЫ
    if (lowerText === "/города" || lowerText === "/cities") {
      const firstCity = "Москва";
      await setDoc(doc(db, "games", chatId), {
        active: true,
        lastCity: firstCity,
        lastLetter: "а",
        lastPlayerId: "orbit_bot",
        lastPlayerName: "🎮 Игровой Бот",
      });

      sendBotMessage(
        `Игра в города началась! Первый город: **${firstCity}**. Твой ход! Назови город на букву **А**.`
      );
      return true;
    }

    // ЕСЛИ ИГРА АКТИВНА
    if (gameState && gameState.active) {
      if (lowerText === "/стоп" || lowerText === "/stop") {
        await updateDoc(doc(db, "games", chatId), { active: false });
        sendBotMessage("Игра в города завершена.");
        return true;
      }

      if (cleanText.startsWith("/")) return false;

      if (gameState.lastPlayerId === currentUserId) {
        sendBotMessage("Подожди, сейчас ход твоего собеседника!");
        return true;
      }

      const firstLetter = lowerText[0];
      const requiredLetter = gameState.lastLetter.toLowerCase();

      if (firstLetter !== requiredLetter) {
        sendBotMessage(
          `Неверно! Нужен город на букву **${requiredLetter.toUpperCase()}**.`
        );
        return true;
      }

      // ИСПОЛЬЗУЕМ БОЛЬШОЙ СПИСОК ГОРОДОВ
      const cityFound = RUSSIAN_CITIES.find(
        (c) => c.toLowerCase() === lowerText
      );

      if (!cityFound) {
        sendBotMessage(`Я не знаю такого города 🤔. Попробуй другой.`);
        return true;
      }

      const newLastLetter = cityFound.slice(-1).toLowerCase();
      const finalLetter =
        newLastLetter === "ь" || newLastLetter === "ы" || newLastLetter === "й"
          ? cityFound.slice(-2, -1).toLowerCase()
          : newLastLetter;

      await updateDoc(doc(db, "games", chatId), {
        lastCity: cityFound,
        lastLetter: finalLetter,
        lastPlayerId: currentUserId,
        lastPlayerName: currentName,
      });

      sendBotMessage(
        `Принято! Город **${cityFound}**. Теперь назови город на букву **${finalLetter.toUpperCase()}**.`
      );
      return true;
    }

    return false;
  };

  return { handleGameMessage, gameState };
};
