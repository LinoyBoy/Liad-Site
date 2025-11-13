import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import TopicPage from "./TopicPage";


export default function CategoryPage({ categoryId, categoryName, goBack }) {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);


  useEffect(() => {
    const topicsRef = collection(db, "categories", categoryId, "topics");
    const unsub = onSnapshot(topicsRef, (snapshot) => {
      setTopics(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [categoryId]);

  const addTopic = async () => {
    if (!newTopic.trim()) return;
    await addDoc(collection(db, "categories", categoryId, "topics"), {
      name: newTopic,
    });
    setNewTopic("");
  };

return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <button
        onClick={goBack}
        className="bg-gray-700 px-4 py-2 rounded mb-4 hover:bg-gray-600"
      >
        תחזור להתחלה
      </button>
      <h1 className="text-3xl font-bold mb-6">{categoryName}</h1>

      <div className="mb-6">
        <input
          className="p-2 text-black rounded mr-2"
          placeholder="?!!! למה ליעד למה"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
        />
        <button
          onClick={addTopic}
          className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
        >
          תוסיף נושא
        </button>
      </div>

      {selectedTopic ? (
        <TopicPage
          categoryId={categoryId}
          topicId={selectedTopic.id}
          topicName={selectedTopic.name}
          goBack={() => setSelectedTopic(null)}
        />
      ) : (
        <ul>
  {topics.map((topic) => (
    <li
      key={topic.id}
      className="flex justify-between items-center p-2 border-b border-gray-700 hover:bg-gray-700 rounded"
    >
      <span
        onClick={() => setSelectedTopic(topic)}
        className="cursor-pointer flex-1"
      >
        {topic.name}
      </span>
      <button
        onClick={async (e) => {
          e.stopPropagation();
          if (window.confirm("Delete this topic and all its notes?")) {
            await deleteDoc(doc(db, "categories", categoryId, "topics", topic.id));
          }
        }}
        className="bg-red-500 px-2 py-1 rounded hover:bg-red-400 ml-2"
      >
        Delete
      </button>
    </li>
  ))}
</ul>
      )}
    </div>
  );
}
