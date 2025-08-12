import type { Express } from "express";
import { storage } from "./storage";

export function setupAdminRoutes(app: Express) {
  // Middleware to check admin access
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user;
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'CLINIC_ADMIN') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  };

  // Admin statistics
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user (admin only)
  app.put("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      const updatedUser = await storage.updateUserByAdmin(userId, updates);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Prevent deleting super admins
      const user = await storage.getUser(userId);
      if (user?.role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Cannot delete super admin" });
      }
      
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all clinics (super admin only)
  app.get("/api/admin/clinics", requireAdmin, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const clinics = await storage.getAllClinics();
      res.json(clinics);
    } catch (error) {
      console.error("Error fetching all clinics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update clinic (super admin only)
  app.put("/api/admin/clinics/:clinicId", requireAdmin, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const { clinicId } = req.params;
      const updates = req.body;
      
      const updatedClinic = await storage.updateClinic(clinicId, updates);
      res.json(updatedClinic);
    } catch (error) {
      console.error("Error updating clinic:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get system logs (admin only)
  app.get("/api/admin/logs", requireAdmin, async (req, res) => {
    try {
      const logs = await storage.getSystemLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching system logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // System backup (super admin only)
  app.post("/api/admin/backup", requireAdmin, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const backupResult = await storage.createSystemBackup();
      res.json(backupResult);
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // System restore (super admin only)
  app.post("/api/admin/restore", requireAdmin, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const { backupId } = req.body;
      const restoreResult = await storage.restoreSystemBackup(backupId);
      res.json(restoreResult);
    } catch (error) {
      console.error("Error restoring backup:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update system settings (admin only)
  app.put("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = req.body;
      const updatedSettings = await storage.updateSystemSettings(settings);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating system settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get system settings (admin only)
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}