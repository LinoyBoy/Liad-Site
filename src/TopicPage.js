import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

export default function TopicPage({ categoryId, topicId, topicName, goBack }) {
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteImage, setNewNoteImage] = useState(null);
  const [isViewer, setIsViewer] = useState(
    localStorage.getItem("mode") === "viewer"
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editNoteData, setEditNoteData] = useState(null);

  // Fetch notes
  useEffect(() => {
    const notesRef = collection(
      db,
      "categories",
      categoryId,
      "topics",
      topicId,
      "notes"
    );
    const unsub = onSnapshot(notesRef, (snapshot) => {
      setNotes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [categoryId, topicId]);

  const uploadImageAndGetUrl = async (file) => {
    if (!file) return "";
    const imageRef = ref(storage, `notes/${Date.now()}_${file.name}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  const addNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    let imageUrl = "";
    if (newNoteImage) imageUrl = await uploadImageAndGetUrl(newNoteImage);

    await addDoc(
      collection(db, "categories", categoryId, "topics", topicId, "notes"),
      {
        title: newNoteTitle,
        content: newNoteContent,
        imageUrl,
      }
    );

    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteImage(null);
  };

  const deleteNote = async (noteId) => {
    if (window.confirm("Delete this note?")) {
      await deleteDoc(
        doc(db, "categories", categoryId, "topics", topicId, "notes", noteId)
      );
    }
  };

  const startEditing = (note) => {
    setEditNoteData({ ...note });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editNoteData.title.trim() || !editNoteData.content.trim()) return;

    let imageUrl = editNoteData.imageUrl || "";
    if (editNoteData.newImage)
      imageUrl = await uploadImageAndGetUrl(editNoteData.newImage);

    const noteRef = doc(
      db,
      "categories",
      categoryId,
      "topics",
      topicId,
      "notes",
      editNoteData.id
    );
    await updateDoc(noteRef, {
      title: editNoteData.title,
      content: editNoteData.content,
      imageUrl,
    });

    setEditModalOpen(false);
    setEditNoteData(null);
  };

  const toggleMode = () => {
    const newMode = !isViewer;
    setIsViewer(newMode);
    localStorage.setItem("mode", newMode ? "viewer" : "editor");
  };

  const handleTextareaKeyDown = (e, setter, value) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newValue =
        value.substring(0, selectionStart) +
        "\n" +
        value.substring(selectionEnd);
      setter(newValue);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goBack}
          className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
        >
          Back
        </button>
        <button
          onClick={toggleMode}
          className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-400"
        >
          {isViewer ? "Switch to Editor" : "Switch to Viewer"}
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">{topicName}</h1>

      {!isViewer && (
        <div className="mb-6 border border-gray-700 p-4 rounded">
          <input
            className="p-2 text-black rounded mb-2 block w-full"
            placeholder="Note Title"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
          />
          <textarea
            className="p-2 text-black rounded mb-2 block w-full"
            placeholder="Note Content (Shift+Enter for newline)"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            onKeyDown={(e) =>
              handleTextareaKeyDown(e, setNewNoteContent, newNoteContent)
            }
            rows={5}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewNoteImage(e.target.files[0])}
            className="mb-2 block"
          />
          <button
            onClick={addNote}
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Note
          </button>
        </div>
      )}

      <ul>
        {notes.map((note) => (
          <li
            key={note.id}
            className="p-3 border-b border-gray-700 hover:bg-gray-800 rounded"
          >
            <div>
              <h3 className="font-semibold text-lg">{note.title}</h3>
              {note.imageUrl && (
                <img
                  src={note.imageUrl}
                  alt=""
                  className="w-32 h-32 object-cover mt-2 rounded"
                />
              )}
              <p className="whitespace-pre-wrap mt-2 text-gray-300">
                {note.content}
              </p>
            </div>

            {!isViewer && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => startEditing(note)}
                  className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="bg-red-500 px-2 py-1 rounded hover:bg-red-400"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Edit Modal */}
      {editModalOpen && editNoteData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-11/12 max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Note</h2>
            <input
              className="p-2 text-black rounded mb-2 block w-full"
              value={editNoteData.title}
              onChange={(e) =>
                setEditNoteData({ ...editNoteData, title: e.target.value })
              }
            />
            <textarea
              className="p-2 text-black rounded mb-2 block w-full"
              value={editNoteData.content}
              onChange={(e) =>
                setEditNoteData({ ...editNoteData, content: e.target.value })
              }
              onKeyDown={(e) =>
                handleTextareaKeyDown(e, (val) =>
                  setEditNoteData({ ...editNoteData, content: val }),
                  editNoteData.content
                )
              }
              rows={5}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setEditNoteData({
                  ...editNoteData,
                  newImage: e.target.files[0],
                })
              }
              className="mb-2 block"
            />
            {editNoteData.imageUrl && (
              <img
                src={editNoteData.imageUrl}
                alt="preview"
                className="w-48 h-48 object-cover rounded mb-2"
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
