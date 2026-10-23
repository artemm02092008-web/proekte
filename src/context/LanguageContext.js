import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "../i18n";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("ru");
  const [isReady, setIsReady] = useState(false);

  // При запуске проверяем сохраненный язык
  useEffect(() => {
    AsyncStorage.getItem("appLanguage").then((saved) => {
      if (saved) {
        setLang(saved);
        i18n.locale = saved;
      }
      setIsReady(true);
    });
  }, []);

  // Функция смены языка
  const changeLanguage = async (newLang) => {
    i18n.locale = newLang; // Меняем в словаре
    setLang(newLang); // Обновляем состояние (вызовет перерисовку)
    await AsyncStorage.setItem("appLanguage", newLang); // Сохраняем
  };

  if (!isReady) return null;

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {/* key={lang} — магия, которая заставляет React мгновенно обновить текст на всех экранах */}
      <React.Fragment key={lang}>{children}</React.Fragment>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
