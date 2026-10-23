import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateProfile } from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { auth, db } from "../firebase/config";
import i18n from "../i18n";

const AppContext = createContext();

export const THEMES = {
  purple: { primary: "#8A56FF", secondary: "#7C6AFA" },
  blue: { primary: "#4F5DED", secondary: "#3B4BD8" },
  green: { primary: "#00C853", secondary: "#00A344" },
};

export const AppProvider = ({ children }) => {
  const [servers, setServers] = useState([]);
  const [activeServerId, setActiveServerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("ru");
  const [isPremium, setIsPremium] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeTheme, setActiveTheme] = useState("purple");

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedLang = await AsyncStorage.getItem("appLanguage");
        const savedTheme = await AsyncStorage.getItem("appTheme");
        if (savedLang) {
          setLanguage(savedLang);
          i18n.locale = savedLang;
        }
        if (savedTheme && THEMES[savedTheme]) setActiveTheme(savedTheme);
      } catch (error) {
        console.log(error);
      }
    };
    loadSavedData();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setUserData(null);
        setIsPremium(false);
        return;
      }
      const unsubDoc = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setIsPremium(data.isPremium || false);
        } else {
          setDoc(
            doc(db, "users", user.uid),
            {
              displayName: user.displayName || "",
              photoURL: user.photoURL || null,
              isPremium: false,
              frame: "default",
            },
            { merge: true }
          );
        }
      });
      return () => unsubDoc();
    });
    return unsubscribe;
  }, []);

  // Сервера загружаются в реальном времени
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setServers([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "servers"),
        where("userId", "==", user.uid)
      );

      const unsubscribeServers = onSnapshot(
        q,
        (querySnapshot) => {
          const loadedServers = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setServers(loadedServers);

          if (loadedServers.length > 0) {
            setActiveServerId((prevId) =>
              loadedServers.find((s) => s.id === prevId)
                ? prevId
                : loadedServers[0].id
            );
          } else {
            setActiveServerId(null);
          }

          setLoading(false);
        },
        (error) => {
          console.log("Ошибка загрузки серверов:", error);
          setLoading(false);
        }
      );

      return () => unsubscribeServers();
    });

    return () => unsubscribeAuth();
  }, []);

  const changeLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem("appLanguage", lang);
      i18n.locale = lang;
      setLanguage(lang);
    } catch (e) {
      console.log(e);
    }
  };

  const changeTheme = async (themeId) => {
    if (!THEMES[themeId]) return;
    try {
      await AsyncStorage.setItem("appTheme", themeId);
      setActiveTheme(themeId);
    } catch (e) {
      console.log(e);
    }
  };

  const themeColors = THEMES[activeTheme] || THEMES.purple;

  const updateUserProfile = async (name, status) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await updateProfile(user, { displayName: name });
      await updateDoc(doc(db, "users", user.uid), {
        displayName: name,
        status: status || "",
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const updateAvatar = async (photoUri) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      let base64Image = "";

      if (Platform.OS === "web") {
        const response = await fetch(photoUri);
        const blob = await response.blob();
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        const FileSystem = require("expo-file-system/legacy");
        const base64 = await FileSystem.readAsStringAsync(photoUri, {
          encoding: "base64",
        });
        base64Image = `data:image/jpeg;base64,${base64}`;
      }

      await updateProfile(user, { photoURL: "updated" });
      await updateDoc(doc(db, "users", user.uid), { photoURL: base64Image });
      setUserData((prev) => ({ ...prev, photoURL: base64Image }));
    } catch (error) {
      console.log("Ошибка аватарки:", error);
      alert("Не удалось сохранить аватарку: " + error.message);
    }
  };

  const setUserFrame = async (frameId) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { frame: frameId });
    } catch (e) {
      console.log(e);
    }
  };

  const activatePremium = async (plan) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { isPremium: true, premiumPlan: plan, premiumSince: new Date() },
        { merge: true }
      );
      setIsPremium(true);
    } catch (e) {
      console.log(e);
    }
  };

  const addServer = async (serverData) => {
    const user = auth.currentUser;
    if (!user) return null;
    try {
      const docRef = await addDoc(collection(db, "servers"), {
        name: serverData.name,
        type: serverData.type,
        icon: serverData.icon || null,
        userId: user.uid,
        createdAt: new Date(),
      });
      const newServer = {
        id: docRef.id,
        ...serverData,
        icon: serverData.icon || null,
        channels: [],
      };
      setServers((prev) => [...prev, newServer]);
      setActiveServerId(newServer.id);
      return newServer;
    } catch (e) {
      console.log(e);
    }
  };

  const deleteServer = async (serverId) => {
    try {
      await deleteDoc(doc(db, "servers", serverId));
      setServers((prev) => prev.filter((s) => s.id !== serverId));
      if (activeServerId === serverId) {
        const remaining = servers.filter((s) => s.id !== serverId);
        setActiveServerId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const renameServer = async (serverId, newName) => {
    try {
      await updateDoc(doc(db, "servers", serverId), { name: newName });
      setServers((prev) =>
        prev.map((s) => (s.id === serverId ? { ...s, name: newName } : s))
      );
    } catch (e) {
      console.log(e);
    }
  };

  const createChannel = async (serverId, channelData) => {
    if (!serverId) return null;
    try {
      const newChannel = {
        id: Date.now().toString(),
        name: channelData.name,
        type: channelData.type,
      };
      await updateDoc(doc(db, "servers", serverId), {
        channels: arrayUnion(newChannel),
      });
      setServers((prev) =>
        prev.map((s) =>
          s.id === serverId
            ? { ...s, channels: [...(s.channels || []), newChannel] }
            : s
        )
      );
      return newChannel;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  // ================= РОЛИ =================
  const createRole = async (serverId, roleData) => {
    if (!serverId) return null;
    try {
      const newRole = {
        id: Date.now().toString(),
        name: roleData.name,
        color: roleData.color || "#8A56FF",
        permissions: roleData.permissions || [],
      };
      await updateDoc(doc(db, "servers", serverId), {
        roles: arrayUnion(newRole),
      });
      setServers((prev) =>
        prev.map((s) =>
          s.id === serverId ? { ...s, roles: [...(s.roles || []), newRole] } : s
        )
      );
      return newRole;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  const deleteRole = async (serverId, roleId) => {
    if (!serverId) return;
    try {
      const server = servers.find((s) => s.id === serverId);
      if (!server) return;
      const updatedRoles = (server.roles || []).filter((r) => r.id !== roleId);
      await updateDoc(doc(db, "servers", serverId), { roles: updatedRoles });
      setServers((prev) =>
        prev.map((s) => (s.id === serverId ? { ...s, roles: updatedRoles } : s))
      );
    } catch (e) {
      console.log(e);
    }
  };

  const assignRole = async (serverId, userId, roleId) => {
    if (!serverId) return;
    try {
      const server = servers.find((s) => s.id === serverId);
      if (!server) return;
      const updatedMemberRoles = {
        ...(server.memberRoles || {}),
        [userId]: roleId,
      };
      await updateDoc(doc(db, "servers", serverId), {
        memberRoles: updatedMemberRoles,
      });
      setServers((prev) =>
        prev.map((s) =>
          s.id === serverId ? { ...s, memberRoles: updatedMemberRoles } : s
        )
      );
    } catch (e) {
      console.log(e);
    }
  };
  // =========================================

  const activeServer =
    servers.find((s) => s.id === activeServerId) || servers[0] || null;

  const contextValue = useMemo(
    () => ({
      servers,
      activeServerId,
      activeServer,
      addServer,
      deleteServer,
      renameServer,
      createChannel,
      createRole, // <-- ДОБАВЛЕНО
      deleteRole, // <-- ДОБАВЛЕНО
      assignRole, // <-- ДОБАВЛЕНО
      setActiveServerId,
      loading,
      language,
      changeLanguage,
      isPremium,
      userData,
      activatePremium,
      updateUserProfile,
      updateAvatar,
      setUserFrame,
      activeTheme,
      changeTheme,
      themeColors,
    }),
    [
      servers,
      activeServerId,
      loading,
      language,
      isPremium,
      userData,
      activeTheme,
    ]
  );

  return (
    <AppContext.Provider
      value={contextValue}
      key={`${language}-${activeTheme}`}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
