import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

let globalLang = "ru";
let listeners = [];

export const useTranslation = () => {
  const [lang, setLang] = useState(globalLang);

  useEffect(() => {
    AsyncStorage.getItem("appLanguage").then((saved) => {
      if (saved) {
        globalLang = saved;
        setLang(saved);
      }
    });
  }, []);

  // Функция перевода принимает объект с переводами
  const t = (translations) => {
    if (!translations) return "";
    // Если есть перевод для текущего языка, возвращаем его
    return translations[lang] || translations["ru"] || "";
  };

  // Функция для смены языка
  const changeLanguage = async (newLang) => {
    globalLang = newLang;
    setLang(newLang);
    // Сообщаем всем экранам, что язык изменился
    listeners.forEach((listener) => listener(newLang));
    await AsyncStorage.setItem("appLanguage", newLang);
  };

  return { t, lang, changeLanguage };
};
