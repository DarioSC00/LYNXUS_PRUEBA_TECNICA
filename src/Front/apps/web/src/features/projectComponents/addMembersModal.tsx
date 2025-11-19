"use client";

import React, { useState, useEffect } from "react";
import DetalModal from "../universalComponents/detailUniversalComponents/detailModal";
import ConfirmDialog from "../universalComponents/confirmUniversalComponent/ConfirmDialog";
import * as projectService from "./projectService/projectService";
import * as userService from "../userComponents/userService/userService";
import { toast } from "react-toastify";

type Props = {
  projectId: number;
  open: boolean;
  onClose: () => void;
  onMemberAdded?: () => void;
};

// Local User type compatible with both service types
type User = {
  id: number;
  name?: string;
  email?: string;
};

export default function AddMembersModal({ projectId, open, onClose, onMemberAdded }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [projectName, setProjectName] = useState<string>("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Confirm dialog states
  const [confirmDeleteMember, setConfirmDeleteMember] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState<number | null>(null);

  // Cargar nombre del proyecto
  useEffect(() => {
    if (open && projectId) {
      (async () => {
        try {
          const project = await projectService.getProject(projectId);
          setProjectName(project.name || "Project");
        } catch (err) {
          console.error("Error loading project:", err);
          setProjectName("Project");
        }
      })();
    }
  }, [open, projectId]);

  // Cargar usuarios disponibles
  useEffect(() => {
    if (open) {
      (async () => {
        setLoadingUsers(true);
        try {
          const res = await userService.listUsers({ page: 1, page_size: 100 });
          setUsers(res.items ?? []);
        } catch (err) {
          console.error("Error loading users:", err);
          toast.error("⚠️ Could not load users list");
        } finally {
          setLoadingUsers(false);
        }
      })();
    }
  }, [open]);

  // Cargar miembros actuales del proyecto
  useEffect(() => {
    if (open && projectId) {
      (async () => {
        setLoadingMembers(true);
        try {
          const membersList = await projectService.getProjectMembers(projectId);
          setMembers(membersList);
        } catch (err) {
          console.error("Error loading project members:", err);
          // No mostrar error si no hay miembros
        } finally {
          setLoadingMembers(false);
        }
      })();
    }
  }, [open, projectId]);

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error("⚠️ Please select a user to add");
      return;
    }

    const userId = Number(selectedUserId);
    
    // Verificar si ya es miembro
    if (members.find(m => m.id === userId)) {
      toast.error("⚠️ This user is already a team member");
      return;
    }

    setSubmitting(true);
    try {
      await projectService.addProjectMember(projectId, userId);
      toast.success("✅ Team member added successfully!");
      
      // Actualizar lista de miembros
      const user = users.find(u => u.id === userId);
      if (user) {
        setMembers(prev => [...prev, user]);
      }
      
      setSelectedUserId("");
      onMemberAdded?.();
    } catch (err: unknown) {
      console.error("Error adding member:", err);
      type ErrorResponse = { response?: { data?: { detail?: string } } };
      const errorMsg = (err as ErrorResponse)?.response?.data?.detail || "❌ Could not add team member. Please try again.";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = (userId: number) => {
    setPendingMemberId(userId);
    setConfirmDeleteMember(true);
  };

  const confirmRemoveMemberAction = async () => {
    if (!pendingMemberId) return;
    setSubmitting(true);
    try {
      await projectService.removeProjectMember(projectId, pendingMemberId);
      toast.success("🗑️ Team member removed successfully");
      setMembers(prev => prev.filter(m => m.id !== pendingMemberId));
      onMemberAdded?.();
    } catch (err: unknown) {
      console.error("Error removing member:", err);
      type ErrorResponse = { response?: { data?: { detail?: string } } };
      const errorMsg = (err as ErrorResponse)?.response?.data?.detail || "❌ Could not remove team member. Please try again.";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
      setPendingMemberId(null);
      setConfirmDeleteMember(false);
    }
  };

  // Filtrar usuarios disponibles (que no son miembros)
  const availableUsers = users.filter(u => !members.find(m => m.id === u.id));

  // Filtrar miembros actuales
  const filteredMembers = members.filter(m =>
    memberSearchTerm === "" ||
    m.name?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  return (<>
    <DetalModal open={open} onClose={onClose} title={`Manage Members - ${projectName}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", minWidth: "500px" }}>
        
        {/* Información del proyecto */}
        <div style={{
          padding: "1rem",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "8px",
          color: "white"
        }}>
          <div style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "0.25rem" }}>
            Managing members for:
          </div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            {projectName}
          </div>
          <div style={{ fontSize: "0.875rem", opacity: 0.9, marginTop: "0.5rem" }}>
            Current members: {members.length}
          </div>
        </div>

        {/* Sección: Agregar nuevo miembro */}
        <div>
          <h3 style={{ 
            fontSize: "1rem", 
            fontWeight: 600, 
            color: "#111827", 
            marginBottom: "1rem" 
          }}>
            Add New Member to Project
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* Select de usuario */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={loadingUsers || submitting}
                style={{
                  flex: 1,
                  padding: "0.625rem 0.875rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  outline: "none",
                  cursor: "pointer",
                  boxSizing: "border-box",
                  backgroundColor: (loadingUsers || submitting) ? "#f9fafb" : "white"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <option value="">Select a user to add...</option>
                {loadingUsers ? (
                  <option value="">Loading users...</option>
                ) : availableUsers.length === 0 ? (
                  <option value="">No users available</option>
                ) : (
                  availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))
                )}
              </select>
              
              <button
                type="button"
                onClick={handleAddMember}
                disabled={!selectedUserId || submitting}
                style={{
                  padding: "0.625rem 1.25rem",
                  background: (selectedUserId && !submitting) 
                    ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" 
                    : "#e5e7eb",
                  color: (selectedUserId && !submitting) ? "white" : "#94a3b8",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: (selectedUserId && !submitting) ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap"
                }}
              >
                {submitting ? "Adding..." : "+ Add"}
              </button>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div style={{ borderTop: "1px solid #e5e7eb" }} />

        {/* Sección: Miembros actuales */}
        <div>
          <h3 style={{ 
            fontSize: "1rem", 
            fontWeight: 600, 
            color: "#111827", 
            marginBottom: "1rem" 
          }}>
            Current Members ({members.length})
          </h3>

          {/* Búsqueda en miembros */}
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              value={memberSearchTerm}
              onChange={(e) => setMemberSearchTerm(e.target.value)}
              placeholder="Search members..."
              style={{
                width: "100%",
                padding: "0.625rem 0.875rem",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {loadingMembers ? (
            <div style={{ 
              padding: "2rem", 
              textAlign: "center", 
              color: "#6b7280",
              fontSize: "0.875rem"
            }}>
              Loading members...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div style={{
              padding: "2rem",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "0.875rem",
              background: "#f9fafb",
              borderRadius: "8px",
              border: "1px dashed #e5e7eb"
            }}>
              {memberSearchTerm ? "No members found" : "No members added yet"}
            </div>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              maxHeight: "300px",
              overflowY: "auto"
            }}>
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    background: "white",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ 
                      fontWeight: 500, 
                      color: "#111827",
                      fontSize: "0.875rem"
                    }}>
                      {member.name || "Unknown"}
                    </div>
                    <div style={{ 
                      fontSize: "0.8rem", 
                      color: "#6b7280" 
                    }}>
                      {member.email}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={submitting}
                    style={{
                      padding: "0.375rem 0.75rem",
                      background: "white",
                      color: "#ef4444",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      cursor: submitting ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.background = "#fef2f2";
                        e.currentTarget.style.borderColor = "#ef4444";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = "#fecaca";
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón de cerrar */}
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-end",
          paddingTop: "1rem",
          borderTop: "1px solid #e5e7eb"
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.625rem 1.25rem",
              background: "white",
              color: "#64748b",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            Close
          </button>
        </div>
      </div>
    </DetalModal>

    <ConfirmDialog
      open={confirmDeleteMember}
      onClose={() => {
        setConfirmDeleteMember(false);
        setPendingMemberId(null);
      }}
      onConfirm={confirmRemoveMemberAction}
      title="Remove Member"
      message="Are you sure you want to remove this member from the project?"
      confirmText="Remove"
      cancelText="Cancel"
      type="warning"
    />
  </>);
}
