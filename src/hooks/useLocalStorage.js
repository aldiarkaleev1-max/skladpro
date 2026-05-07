import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const authContext = useAuth();
  const currentUser = authContext ? authContext.currentUser : null;

  useEffect(() => {
    // Если нет пользователя (например, на странице логина), возвращаем моковые данные
    if (!currentUser) {
      setStoredValue(initialValue);
      return;
    }

    const docRef = doc(db, 'userStorage', currentUser.uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data[key] !== undefined) {
          setStoredValue(data[key]);
        } else {
          // Инициализируем поле, если его еще нет
          setDoc(docRef, { [key]: initialValue }, { merge: true });
          setStoredValue(initialValue);
        }
      } else {
        // Создаем документ для нового пользователя
        setDoc(docRef, { [key]: initialValue }, { merge: true });
        setStoredValue(initialValue);
      }
    }, (error) => {
      console.error("Ошибка Firestore:", error);
    });

    return () => unsubscribe();
  }, [currentUser, key]); // Убрали initialValue из зависимостей, чтобы избежать циклов

  const setValue = async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Оптимистичное обновление UI
      setStoredValue(valueToStore);
      
      // Сохраняем в облако
      if (currentUser) {
        const docRef = doc(db, 'userStorage', currentUser.uid);
        await setDoc(docRef, { [key]: valueToStore }, { merge: true });
      } else {
        // Если вдруг без авторизации, сохраняем локально как резерв
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
