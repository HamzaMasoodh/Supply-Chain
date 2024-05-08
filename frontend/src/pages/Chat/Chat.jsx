import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Chat.css";
import { toast } from "react-toastify";

function Chat() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [selectedFile, setSelectedFile] = useState([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_FLASK_URL + "/api/get_chats"
      );
      setChats(response.data);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  const loadChat = async (chatId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_FLASK_URL}/api/get_chat_history/${chatId}`
      );
      setMessages(response.data.messages);
      setCurrentChatId(chatId);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const newChat = async () => {
    const title = prompt("Enter a title for the new chat:", "New Chat");
    if (title) {
      try {
        const response = await axios.post(
          process.env.REACT_APP_FLASK_URL + "/api/new_chat",
          { title }
        );
        setCurrentChatId(response.data.chat_id);
        loadChats();
        setMessages([]);
      } catch (error) {
        console.error("Error creating new chat:", error);
      }
    }
  };

  const sendMessage = async () => {
    if (!currentChatId) {
      toast.error("Please start a new chat or select an existing chat.");
      return;
    }

    if (userInput.trim() === "") return;

    try {
      const response = await axios.post(
        process.env.REACT_APP_FLASK_URL + "/api/chatbot",
        {
          message: userInput,
          chat_id: currentChatId,
        }
      );

      const userMessage = { role: "user", content: userInput };
      const botMessage = { role: "bot", content: response.data.response };

      setMessages([...messages, userMessage, botMessage]);
      setUserInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_FLASK_URL}/api/delete_chat/${chatId}`
      );
      loadChats();
      if (chatId === currentChatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files);
  };
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {
    if (selectedFile.length > 0) {
      setLoading(true);
      toast.info("Please wait while we are uploading");
  
      const formData = new FormData();
      for (let file of selectedFile) {
        formData.append("files", file);
      }
  
      try {
        await axios.post(
          process.env.REACT_APP_FLASK_URL + "/api/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setSelectedFile([]);
        setShowUpload(false)
        toast.success("Files uploaded and processed successfully.");
      } catch (error) {
        console.error("Error uploading files:", error);
        toast.error("Error uploading files.");
      }
  
      setLoading(false);
    } else {
      toast.warning("Please select files to upload.");
    }
  };

  return (
    <div className="container">
      <div className="row clearfix">
        <div className="col-lg-12">
          <div className="card chat-app">
            <div id="plist" className="people-list">
              <div>
                <button onClick={newChat} className="btn btn-primary">
                  Create New Chat
                </button>
              </div>
              <ul className="list-unstyled chat-list mt-2 mb-0">
                {chats.map((chat) => (
                  <li
                    className={`clearfix ${
                      currentChatId == chat.id ? "active" : ""
                    }`}
                    key={chat.id}
                    onClick={() => loadChat(chat.id)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>{chat.title}</div>
                      <i
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        className="fa fa-trash text-danger fs-5"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="chat">
              <div className="chat-header clearfix">
                <div className="row">
                  <div className="col-lg-6">
                    <div>
                      {showUpload ? (
                        <>
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                          />
                          <button
                            onClick={uploadFile}
                            className="btn btn-primary"
                            disabled={loading}
                          >
                            Upload Files
                          </button>
                        </>
                      ) : (
                        <div
                          onClick={() => setShowUpload(true)}
                          className="mb-2 btn btn-sm btn-success"
                        >
                          Upload document to enhance model capability
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="chat-history">
                <ul className="m-b-0">
                  {messages.map((message, index) => (
                    <li className="clearfix">
                      <div
                        className={`${
                          message.role == "user"
                            ? "message other-message float-right"
                            : "message my-message"
                        }`}
                      >
                        {message.content}
                      </div>
                    </li>
                  ))}
                </ul>
                {!currentChatId && (
                  <div className="text-center fs-4 fw-bold">
                    Please select any chat or create new one
                  </div>
                )}
              </div>
              {currentChatId && (
                <div className="chat-message clearfix">
                  <div className="input-group mb-0">
                    <input
                      type="text"
                      className="form-control"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Ask a question..."
                    />
                    <div className="input-group-prepend">
                      <span className="input-group-text" onClick={sendMessage}>
                        <i className="fa fa-send" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
      <div className="powered">
        Powered by <span className="fs-4 fw-bold">HOLMAN</span>
      </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
