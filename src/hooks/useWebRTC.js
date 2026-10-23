import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from "react-native-webrtc";
import { db } from "../firebase/config";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const useWebRTC = (callId, currentUserId) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const pc = useRef(null);

  useEffect(() => {
    if (!callId || !currentUserId) return;

    const startCall = async () => {
      // 1. Получаем доступ к микрофону
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setLocalStream(stream);

      // 2. Создаем PeerConnection
      pc.current = new RTCPeerConnection(configuration);

      stream.getTracks().forEach((track) => {
        pc.current.addTrack(track, stream);
      });

      pc.current.addEventListener("track", (event) => {
        setRemoteStream(event.streams[0]);
      });

      pc.current.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
          addDoc(collection(db, "calls", callId, "candidates"), {
            userId: currentUserId,
            candidate: event.candidate.toJSON(),
          });
        }
      });

      const callDoc = doc(db, "calls", callId);

      // 3. Если мы инициатор (звоним) - создаем offer
      // Для простоты: первый, кто зашел в канал, создает offer
      const data =
        (await new Promise((resolve) => {
          const unsub = onSnapshot(callDoc, (snap) => {
            unsub();
            resolve(snap.data());
          });
        })) || {};

      if (!data.offer) {
        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);
        await setDoc(
          callDoc,
          { offer: offer.toJSON(), callerId: currentUserId },
          { merge: true }
        );
      }

      // 4. Слушаем ответ (если мы инициатор) или оффер (если мы принимаем)
      const unsubOffer = onSnapshot(callDoc, async (snapshot) => {
        const docData = snapshot.data();
        if (!docData) return;

        if (
          !pc.current.currentRemoteDescription &&
          docData.offer &&
          docData.callerId !== currentUserId
        ) {
          await pc.current.setRemoteDescription(
            new RTCSessionDescription(docData.offer)
          );
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          await updateDoc(callDoc, { answer: answer.toJSON() });
        }

        if (docData.answer && docData.callerId === currentUserId) {
          await pc.current.setRemoteDescription(
            new RTCSessionDescription(docData.answer)
          );
        }
      });

      // 5. Слушаем ICE-кандидатов
      const unsubCandidates = onSnapshot(
        collection(db, "calls", callId, "candidates"),
        (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              if (data.userId !== currentUserId) {
                await pc.current.addIceCandidate(
                  new RTCIceCandidate(data.candidate)
                );
              }
            }
          });
        }
      );

      setIsConnected(true);

      return () => {
        unsubOffer();
        unsubCandidates();
        stream.getTracks().forEach((t) => t.stop());
        pc.current.close();
      };
    };

    startCall();
  }, [callId, currentUserId]);

  return { localStream, remoteStream, isConnected };
};
