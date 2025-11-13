import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import CategoryPage from "./CategoryPage";

function App() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snapshot) => {
      setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await addDoc(collection(db, "categories"), { name: newCategory });
    setNewCategory("");
  };

  if (selectedCategory) {
    return (
      <CategoryPage
        categoryId={selectedCategory.id}
        categoryName={selectedCategory.name}
        goBack={() => setSelectedCategory(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">עד מתיייי</h1>

      <div className="mb-6">
        <input
          className="p-2 text-black rounded mr-2"
          placeholder="למה עוד"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button
          onClick={addCategory}
          className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
        >
          תוסיף
        </button>
      </div>

      <ul>
  {categories.map((cat) => (
    <li
      key={cat.id}
      className="flex justify-between items-center p-2 border-b border-gray-700 hover:bg-gray-800 rounded"
    >
      {/* Category name or edit input */}
      {cat.isEditing ? (
        <input
          type="text"
          className="p-1 text-black rounded flex-1 mr-2"
          value={cat.newName || cat.name}
          onChange={(e) =>
            setCategories((prev) =>
              prev.map((c) =>
                c.id === cat.id ? { ...c, newName: e.target.value } : c
              )
            )
          }
        />
      ) : (
        <span
          onClick={() => setSelectedCategory(cat)}
          className="cursor-pointer flex-1"
        >
          {cat.name}
        </span>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {cat.isEditing ? (
          <>
            <button
              onClick={async () => {
                const newName = cat.newName?.trim();
                if (!newName) return;
                await updateDoc(doc(db, "categories", cat.id), { name: newName });
                setCategories((prev) =>
                  prev.map((c) =>
                    c.id === cat.id ? { ...c, isEditing: false, name: newName } : c
                  )
                );
              }}
              className="border border-green-400 text-green-400 px-2 py-1 rounded hover:bg-green-400 hover:text-black transition"
            >
              Save
            </button>
            <button
              onClick={() =>
                setCategories((prev) =>
                  prev.map((c) =>
                    c.id === cat.id ? { ...c, isEditing: false } : c
                  )
                )
              }
              className="border border-gray-400 text-gray-300 px-2 py-1 rounded hover:bg-gray-400 hover:text-black transition"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() =>
                setCategories((prev) =>
                  prev.map((c) =>
                    c.id === cat.id ? { ...c, isEditing: true, newName: c.name } : c
                  )
                )
              }
              className="border border-blue-400 text-blue-400 px-2 py-1 rounded hover:bg-blue-400 hover:text-black transition"
            >
              Edit
            </button>

            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${cat.name}" and all its topics?`)) {
                  await deleteDoc(doc(db, "categories", cat.id));
                }
              }}
              className="border border-red-400 text-red-400 px-2 py-1 rounded hover:bg-red-400 hover:text-black transition"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  ))}
</ul>
    </div>
  );
}

export default App;
