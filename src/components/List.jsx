import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CircleCheck, Edit, Plane, RefreshCcw, Trash } from "lucide-react";
import { useState } from "react";

const Form = () => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [formData, setFormData] = useState({
    taskname: "",
    description: "",
    duedate: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing && editIndex !== null) {
      const updated = [...list];
      updated[editIndex] = {
        ...updated[editIndex],
        text: formData.taskname,
        description: formData.description,
        duedate: formData.duedate,
      };
      setList(updated);
      setIsEditing(false);
      setEditIndex(null);
    } else {
      const newTask = {
        id: Date.now(),
        text: formData.taskname,
        description: formData.description,
        duedate: formData.duedate,
        completed: false,
      };
      setList([...list, newTask]);
    }

    setFormData({
      taskname: "",
      description: "",
      duedate: "",
    });
    setShowModal(false);
    setIsEditing(false);
  };

  const handleEdit = (index) => {
    const task = list[index];
    setFormData({
      taskname: task.text,
      description: task.description,
      duedate: task.duedate,
    });
    setIsEditing(true);
    setShowModal(true);
    setEditIndex(index);
  };

  const handleDelete = () => {
    const filter = list.filter((_, ind) => ind !== deleteIndex);
    setList(filter);
    setShowDelete(false);
    setDeleteIndex(null);
  };

  const toggleEffect = (index) => {
    const updated = [...list];
    updated[index].completed = !updated[index].completed;
    setList(updated);
  };

  const filteredList = list.filter((item) =>
    item.text.toLowerCase().includes(search.toLowerCase())
  );

  const pointerSensor = useSensor(PointerSensor);
  const sensors = useSensors(pointerSensor);

  const SortableItem = ({ item, toggleEffect, handleEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="bg-gray-500 w-full rounded-md space-y-2 px-3 py-4 text-white"
      >
        <div {...listeners} className="cursor-grab select-none mb-2">
          ...
        </div>
        <h3
          className={`font-bold text-lg ${
            item.completed ? "line-through text-gray-400" : ""
          }`}
        >
          {item.text}
        </h3>
        <p className="text-sm text-gray-300">{item.description}</p>
        <p className="text-xs text-yellow-300 font-bold">
          Due Date: {item.duedate}
        </p>
        <div className="flex justify-between">
          <div>
            <button className="flex gap-1 items-center" onClick={toggleEffect}>
              {item.completed ? (
                <RefreshCcw className="h-5 w-5" />
              ) : (
                <CircleCheck className="h-5 w-5" />
              )}
              {item.completed ? "Mark Undone" : "Mark Completed"}
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              className="flex gap-1 items-center cursor-pointer"
              onClick={handleEdit}
            >
              <Edit className="w-5 h-5" />
              <span className="font-semibold">Edit</span>
            </button>
            <button
              className="flex gap-1 items-center text-red-700 hover:text-red-800 cursor-pointer"
              onClick={onDelete}
            >
              <Trash className="w-5 h-5" />
              <span className="font-semibold">Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleDragEnd = (e) => {
    const { active, over } = e;

    if (active.id !== over?.id) {
      setList((prevList) => {
        const oldIndex = list.findIndex((item) => item.id === active.id);
        const newIndex = list.findIndex((item) => item.id === over.id);
        return arrayMove(prevList, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className=" flex justify-center py-8 px-4 sm:px-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="gap-3 flex flex-col sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search tasks..."
            className="flex-1 border rounded-md px-3 py-2 focus:outline-none"
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-2 py-2"
            onClick={() => setShowModal(true)}
          >
            Add Task
          </button>
        </div>

        {filteredList.length === 0 ? (
          <div className="flex justify-center">
            <div className="bg-gray-400 w-full rounded-md space-y-3 text-center px-3 py-6">
              <Plane className=" bg-white rounded-full h-8 w-9 p-1 mx-auto" />
              <span className="text-white font-medium text-lg">
                You have nothing to do!
              </span>
            </div>
          </div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            sensors={sensors}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              strategy={verticalListSortingStrategy}
              items={filteredList.map((item) => item.id)}
            >
              <div className="space-y-3">
                {filteredList.map((item) => {
                  const fullIndex = list.findIndex((i) => i.id === item.id);
                  return (
                    <SortableItem
                      key={item.id}
                      item={item}
                      toggleEffect={() => toggleEffect(fullIndex)}
                      handleEdit={() => handleEdit(fullIndex)}
                      setShowDelete={setShowDelete}
                      onDelete={() => {
                        setDeleteIndex(fullIndex);
                        setShowDelete(true);
                      }}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {showDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-md shadow-lg max-w-md w-full p-6">
              <h2 className="text-lg text-center font-bold mb-8">
                Are you sure you want to delete this task?
              </h2>
              <div className="flex justify-center space-x-4">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white rounded-md py-2 px-3"
                  onClick={() => handleDelete()}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDelete(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white rounded-md py-2 px-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-md shadow-lg max-w-md w-full">
              <h2 className="text-center text-2xl font-bold pt-4">
                {isEditing ? "Edit Task" : "Add Task"}
              </h2>
              <form className="p-6 space-y-3" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-gray-600 font-semibold block">
                    Task Name:
                  </label>
                  <input
                    type="text"
                    placeholder="task name"
                    required
                    value={formData.taskname}
                    onChange={(e) =>
                      setFormData({ ...formData, taskname: e.target.value })
                    }
                    className="border rounded-md w-full px-2 py-1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-600 font-semibold block">
                    Description:
                  </label>
                  <input
                    type="text"
                    placeholder="description"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="border rounded-md w-full px-2 py-1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-600 font-semibold block">
                    Due Date:
                  </label>
                  <input
                    type="date"
                    value={formData.duedate}
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, duedate: e.target.value })
                    }
                    className="border rounded-md w-full px-2 py-1 mb-4"
                  />
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setIsEditing(false);
                      setFormData({
                        taskname: "",
                        description: "",
                        duedate: "",
                      });
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white rounded-md py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-3"
                  >
                    {isEditing ? "Edit Task" : "Add Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Form;
