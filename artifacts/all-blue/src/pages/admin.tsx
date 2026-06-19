import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminDeleteChef,
  useAdminDeleteMenuItem,
  useAdminDeleteOrder,
  useAdminDeleteReview,
  useAdminDeleteUser,
  useAdminListOrders,
  useAdminListReviews,
  useAdminListUsers,
  useAdminUpdateChef,
  useAdminUpdateMenuItem,
  useAdminUpdateOrder,
  useAdminUpdateUser,
  useCreateChef,
  useCreateMenuItem,
  useListChefs,
  useListMenuItems,
  type AdminOrderUpdateStatus,
  type MenuItemOrigin,
} from "@workspace/api-client-react";
import {
  Check,
  ChefHat,
  ChevronDown,
  ImageOff,
  MessageSquare,
  Pencil,
  Plus,
  Shield,
  ShoppingBag,
  Star,
  Trash2,
  User,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useSearch } from "wouter";

type Tab = "users" | "orders" | "reviews" | "menu" | "chefs";

const ORIGINS: { value: MenuItemOrigin; label: string }[] = [
  { value: "north_blue", label: "North Blue" },
  { value: "south_blue", label: "South Blue" },
  { value: "east_blue", label: "East Blue" },
  { value: "west_blue", label: "West Blue" },
];

interface MenuEditState {
  id: number;
  name: string;
  description: string;
  price: string;
  origin: MenuItemOrigin;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

const BLANK_MENU_EDIT: Omit<MenuEditState, "id"> = {
  name: "", description: "", price: "", origin: "east_blue",
  category: "", imageUrl: "", isAvailable: true, isFeatured: false,
};

interface ChefEditState {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  yearsExperience: string;
  imageUrl: string;
}

const BLANK_CHEF_EDIT: Omit<ChefEditState, "id"> = {
  name: "", specialty: "",
  bio: "", yearsExperience: "", imageUrl: "",
};

interface UserEditState {
  id: number;
  name: string;
  phone: string;
  role: "customer" | "admin";
}

interface OrderEditState {
  id: number;
  status: string;
  adminNote: string;
}



const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "preparing", label: "Preparing", color: "bg-blue-100 text-blue-800" },
  { value: "out_for_delivery", label: "Delivering", color: "bg-purple-100 text-purple-800" },
  { value: "delivered", label: "Order Received", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

function statusLabel(s: string) {
  return ORDER_STATUSES.find(x => x.value === s)?.label ?? s.replace(/_/g, " ");
}
function statusColor(s: string) {
  return ORDER_STATUSES.find(x => x.value === s)?.color ?? "";
}

export default function Admin() {
  const { currentUser, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(search);
  const initialTab: Tab =
    searchParams.get("tab") === "orders"
      ? "orders"
      : searchParams.get("tab") === "reviews"
      ? "reviews"
      : searchParams.get("tab") === "menu"
      ? "menu"
      : searchParams.get("tab") === "chefs"
      ? "chefs"
      : "users";

  const autoOpenNew = searchParams.get("new") === "1";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [userEditState, setUserEditState] = useState<UserEditState | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [orderEditState, setOrderEditState] = useState<OrderEditState | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [menuEditState, setMenuEditState] = useState<MenuEditState | null>(null);
  const [deletingMenuId, setDeletingMenuId] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(autoOpenNew);
  const [newMenu, setNewMenu] = useState<Omit<MenuEditState, "id">>(BLANK_MENU_EDIT);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editUploadingImage, setEditUploadingImage] = useState(false);
  const [showAddChef, setShowAddChef] = useState(false);
  const [chefEditState, setChefEditState] = useState<ChefEditState | null>(null);
  const [editingChefId, setEditingChefId] = useState<number | null>(null);
  const [deletingChefId, setDeletingChefId] = useState<number | null>(null);
  const [isDeletingChef, setIsDeletingChef] = useState(false);
  const [newChef, setNewChef] = useState<Omit<ChefEditState, "id">>(BLANK_CHEF_EDIT);

  // List hooks
  const requestOpts = currentUser
    ? { headers: { "x-user-id": String(currentUser.id) } }
    : undefined;

  const {
    data: users,
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useAdminListUsers({ request: requestOpts });
  const {
    data: orders,
    isLoading: loadingOrders,
    refetch: refetchOrders,
  } = useAdminListOrders({ request: requestOpts });
  const {
    data: reviews,
    isLoading: loadingReviews,
    refetch: refetchReviews,
  } = useAdminListReviews({ request: requestOpts });
  const {
    data: menuItems,
    isLoading: loadingMenu,
    refetch: refetchMenu,
  } = useListMenuItems({});
  const {
    data: chefs,
    isLoading: loadingChefs,
    refetch: refetchChefs,
  } = useListChefs({});

  const pendingCount = orders?.filter((o) => o.status === "pending").length ?? 0;

  // Mutations
  const updateUser = useAdminUpdateUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "User updated" });
        setUserEditState(null);
        refetchUsers();
      },
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    },
    request: requestOpts,
  });

  const deleteUser = useAdminDeleteUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "User deleted" });
        setDeletingUserId(null);
        refetchUsers();
      },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    },
    request: requestOpts,
  });

  const updateOrder = useAdminUpdateOrder({
    mutation: {
      onSuccess: () => {
        toast({ title: "Order updated" });
        setOrderEditState(null);
        refetchOrders();
      },
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    },
    request: requestOpts,
  });

  const deleteOrder = useAdminDeleteOrder({
    mutation: {
      onSuccess: () => {
        toast({ title: "Order deleted" });
        setDeletingOrderId(null);
        refetchOrders();
      },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    },
    request: requestOpts,
  });

  const deleteReview = useAdminDeleteReview({
    mutation: {
      onSuccess: () => {
        toast({ title: "Review deleted" });
        setDeletingReviewId(null);
        refetchReviews();
      },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    },
    request: requestOpts,
  });

  const updateMenuItem = useAdminUpdateMenuItem({
    mutation: {
      onSuccess: () => {
        toast({ title: "Menu item updated" });
        setMenuEditState(null);
        refetchMenu();
      },
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    },
    request: requestOpts,
  });

  const deleteMenuItem = useAdminDeleteMenuItem({
    mutation: {
      onSuccess: () => {
        toast({ title: "Menu item deleted" });
        setDeletingMenuId(null);
        refetchMenu();
      },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    },
    request: requestOpts,
  });

  const createMenuItem = useCreateMenuItem({
    mutation: {
      onSuccess: () => {
        toast({ title: "Menu item added" });
        setShowAddMenu(false);
        setNewMenu(BLANK_MENU_EDIT);
        refetchMenu();
      },
      onError: () => toast({ title: "Create failed", variant: "destructive" }),
    },
  });

  const uploadImage = async (file: File, isEdit: boolean) => {
    const setter = isEdit ? setEditUploadingImage : setUploadingImage;
    setter(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/upload/menu-image", {
        method: "POST",
        headers: { "x-user-id": String(currentUser?.id ?? "") },
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json() as { url: string };
      if (isEdit) {
        setMenuEditState((s) => (s ? { ...s, imageUrl: url } : s));
      } else {
        setNewMenu((s) => ({ ...s, imageUrl: url }));
      }
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Image upload failed", variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  const uploadChefImage = async (file: File, isEdit: boolean) => {
    const setter = isEdit ? setEditUploadingImage : setUploadingImage;
    setter(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/upload/chef-image", {
        method: "POST",
        headers: { "x-user-id": String(currentUser?.id ?? "") },
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json() as { url: string };
      if (isEdit) {
        setChefEditState(s => s ? { ...s, imageUrl: url } : s);
      } else {
        setNewChef(s => ({ ...s, imageUrl: url }));
      }
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Image upload failed", variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  const createChef = useCreateChef({
    mutation: {
      onSuccess: () => {
        toast({ title: "Chef created" });
        setShowAddChef(false);
        setNewChef(BLANK_CHEF_EDIT);
        refetchChefs();
      },
      onError: () => toast({ title: "Create failed", variant: "destructive" }),
    },
  });

  const deleteChef = useAdminDeleteChef({
    mutation: {
      onSuccess: () => {
        toast({ title: "Chef deleted" });
        setDeletingChefId(null);
        refetchChefs();
      },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    },
    request: requestOpts,
  });

  const updateChef = useAdminUpdateChef({
    mutation: {
      onSuccess: () => {
        toast({ title: "Chef updated" });
        setEditingChefId(null);
        refetchChefs();
      },
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    },
    request: requestOpts,
  });

  // Render logic
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-serif text-3xl text-primary mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-6 h-6 text-accent" />
          <h1 className="font-serif text-4xl text-primary">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground ml-9">Manage users, orders, and reviews.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border overflow-x-auto">
        {([
          { id: "users" as Tab, icon: <Users className="w-4 h-4" />, label: "Users", count: users?.length },
          { id: "orders" as Tab, icon: <ShoppingBag className="w-4 h-4" />, label: "Orders", count: orders?.length, alert: pendingCount },
          { id: "reviews" as Tab, icon: <MessageSquare className="w-4 h-4" />, label: "Reviews", count: reviews?.length },
          { id: "menu" as Tab, icon: <UtensilsCrossed className="w-4 h-4" />, label: "Menu", count: menuItems?.length },
          { id: "chefs" as Tab, icon: <ChefHat className="w-4 h-4" />, label: "Chefs", count: chefs?.length },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon} {t.label}
            {t.count != null && (
              <span className="ml-1 bg-accent/10 text-accent text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>
            )}
            {"alert" in t && t.alert > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {t.alert}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
              ))}</div>
            ) : !users?.length ? (
              <p className="text-muted-foreground text-center py-8">No users yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-left">
                      <th className="pb-3 pr-4 font-medium">ID</th>
                      <th className="pb-3 pr-4 font-medium">Name</th>
                      <th className="pb-3 pr-4 font-medium">Phone</th>
                      <th className="pb-3 pr-4 font-medium">Role</th>
                      <th className="pb-3 pr-4 font-medium">Joined</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {users.map((user) => {
                      const isEditing = userEditState?.id === user.id;
                      const isDeleting = deletingUserId === user.id;
                      const isSelf = user.id === currentUser.id;
                      return (
                        <tr key={user.id} className="group hover:bg-muted/30 transition-colors">
                          <td className="py-3 pr-4 text-muted-foreground font-mono">{user.id}</td>
                          <td className="py-3 pr-4">
                            {isEditing ? (
                              <Input
                                value={userEditState?.name}
                                onChange={(e) => setUserEditState((s) => (s ? { ...s, name: e.target.value } : s))}
                                className="h-7 text-sm w-32"
                              />
                            ) : (
                              <span className="font-medium">{user.name ?? <span className="text-muted-foreground italic">—</span>}</span>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            {isEditing ? (
                              <Input
                                value={userEditState?.phone}
                                onChange={(e) => setUserEditState((s) => (s ? { ...s, phone: e.target.value } : s))}
                                className="h-7 text-sm w-36"
                              />
                            ) : (
                              <span className="font-mono">{user.phone}</span>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            {isEditing ? (
                              <select
                                value={userEditState?.role}
                                onChange={(e) =>
                                  setUserEditState((s) => (s ? { ...s, role: e.target.value as "customer" | "admin" } : s))
                                }
                                className="h-7 text-sm border border-border rounded px-2 bg-background"
                              >
                                <option value="customer">customer</option>
                                <option value="admin">admin</option>
                              </select>
                            ) : (
                              <Badge
                                variant="secondary"
                                className={user.role === "admin" ? "bg-accent/10 text-accent border-accent/20" : ""}
                              >
                                {user.role === "admin" ? (
                                  <Shield className="w-3 h-3 mr-1 inline" />
                                ) : (
                                  <User className="w-3 h-3 mr-1 inline" />
                                )}
                                {user.role}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 text-right">
                            {isDeleting ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-xs text-muted-foreground mr-1">Delete?</span>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 px-2"
                                  onClick={() => deleteUser.mutate({ id: user.id })}
                                  disabled={deleteUser.isPending}
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() => setDeletingUserId(null)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  className="h-7 px-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                                  onClick={() =>
                                    updateUser.mutate({
                                      id: user.id,
                                      data: {
                                        name: userEditState?.name || null,
                                        phone: userEditState?.phone || "",
                                        role: userEditState?.role || "customer",
                                      },
                                    })
                                  }
                                  disabled={updateUser.isPending}
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setUserEditState(null)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 hover:text-foreground"
                                  onClick={() =>
                                    setUserEditState({
                                      id: user.id,
                                      name: user.name ?? "",
                                      phone: user.phone,
                                      role: user.role ?? "customer",
                                    })
                                  }
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 hover:text-destructive"
                                  onClick={() => setDeletingUserId(user.id)}
                                  disabled={isSelf}
                                  title={isSelf ? "Can't delete yourself" : "Delete"}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="space-y-4">
          {pendingCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
              {pendingCount} new order{pendingCount > 1 ? "s" : ""} waiting — update their status below.
            </div>
          )}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">All Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}</div>
              ) : !orders?.length ? (
                <p className="text-muted-foreground text-center py-8">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {[...orders].reverse().map((order) => {
                    const isEditing = orderEditState?.id === order.id;
                    const isDeleting = deletingOrderId === order.id;
                    return (
                      <div key={order.id} className="border border-border/50 rounded-xl p-4 hover:bg-muted/20 transition-colors">
                        {/* Order info */}
                        <div className="flex items-start justify-between gap-4">
                          {/* Left side */}
                          <div className="flex-1 min-w-0">
                            {/* Basic info */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-mono bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">
                                {order.reference ?? `#${order.id}`}
                              </span>
                              {isEditing ? (
                                <div className="relative">
                                  <select
                                    value={orderEditState?.status}
                                    onChange={(e) => setOrderEditState((s) => (s ? { ...s, status: e.target.value } : s))}
                                    className="h-7 text-xs border border-border rounded-full px-3 pr-7 bg-background appearance-none font-medium"
                                  >
                                    {ORDER_STATUSES.map((s) => (
                                      <option key={s.value} value={s.value}>
                                        {s.label}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3 h-3 absolute right-2 top-2 pointer-events-none text-muted-foreground" />
                                </div>
                              ) : (
                                <Badge variant="secondary" className={statusColor(order.status)}>
                                  {statusLabel(order.status)}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
                              {order.customerName
                                ? <span className="text-xs font-medium text-foreground bg-secondary/40 px-2 py-0.5 rounded-full">👤 {order.customerName}</span>
                                : order.userId && <span className="text-xs text-muted-foreground">User #{order.userId}</span>
                              }
                            </div>

                            {/* Delivery address */}
                            <div className="text-sm text-muted-foreground mb-1 truncate">📍 {order.deliveryAddress}</div>

                            {/* Price and items */}
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-semibold text-accent">${order.total.toFixed(2)}</span>
                              <span className="text-muted-foreground">
                                {Array.isArray(order.items) ? order.items.length : 0} item{Array.isArray(order.items) && order.items.length !== 1 ? "s" : ""}
                              </span>
                            </div>

                            {/* Items list */}
                            {Array.isArray(order.items) && order.items.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {(order.items as Array<{ name?: string; quantity?: number; price?: number }>).map((item, i) => (
                                  <span key={i} className="text-xs bg-secondary/30 text-secondary-foreground px-2 py-0.5 rounded-full">
                                    {item.quantity}× {item.name ?? "Item"}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Admin note */}
                            {isEditing ? (
                              <div className="mt-3">
                                <label className="text-xs font-medium text-muted-foreground block mb-1">
                                  Note / Alternative suggestion for customer
                                </label>
                                <Input
                                  value={orderEditState?.adminNote}
                                  onChange={(e) => setOrderEditState((s) => (s ? { ...s, adminNote: e.target.value } : s))}
                                  placeholder="e.g. 'Sea King Stew is unavailable, we suggest Tropical Coral Fish instead'"
                                  className="text-sm h-9"
                                />
                              </div>
                            ) : order.adminNote ? (
                              <div className="mt-2 text-xs bg-accent/10 border border-accent/20 text-accent px-3 py-1.5 rounded-lg">
                                💬 {order.adminNote}
                              </div>
                            ) : null}
                          </div>

                          {/* Right side actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isDeleting ? (
                              <>
                                <span className="text-xs text-muted-foreground">Delete?</span>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 px-2"
                                  onClick={() => deleteOrder.mutate({ id: order.id })}
                                  disabled={deleteOrder.isPending}
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() => setDeletingOrderId(null)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            ) : isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  className="h-7 px-3 bg-accent hover:bg-accent/90 text-accent-foreground text-xs"
                                  onClick={() =>
                                    updateOrder.mutate({
                                      id: order.id,
                                      data: {
                                        status: orderEditState?.status as AdminOrderUpdateStatus,
                                        adminNote: orderEditState?.adminNote || null,
                                      },
                                    })
                                  }
                                  disabled={updateOrder.isPending}
                                >
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setOrderEditState(null)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs gap-1"
                                  onClick={() =>
                                    setOrderEditState({ id: order.id, status: order.status, adminNote: order.adminNote ?? "" })
                                  }
                                >
                                  <Pencil className="w-3 h-3" /> Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 hover:text-destructive"
                                  onClick={() => setDeletingOrderId(order.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reviews Tab */}
      {tab === "reviews" && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingReviews ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}</div>
            ) : !reviews?.length ? (
              <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => {
                  const isDeleting = deletingReviewId === review.id;
                  return (
                    <div key={review.id} className="group border border-border/50 rounded-xl p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        {/* Review info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm text-foreground">{review.userName}</span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                                />
                              ))}
                            </div>
                            {review.menuItemId && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Item #{review.menuItemId}</span>
                            )}
                            <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                        </div>
                        {/* Delete button */}
                        <div className="flex-shrink-0">
                          {isDeleting ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Delete?</span>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 px-2"
                                onClick={() => deleteReview.mutate({ id: review.id })}
                                disabled={deleteReview.isPending}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => setDeletingReviewId(null)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                              onClick={() => setDeletingReviewId(review.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Menu Tab */}
      {tab === "menu" && (
        <div className="space-y-4">
          {/* Add new menu item */}
          {showAddMenu ? (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="font-serif text-xl text-primary flex items-center gap-2">
                  <Plus className="w-5 h-5 text-accent" /> New Menu Item
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Form for new menu item */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Name *</label>
                    <Input
                      value={newMenu.name}
                      onChange={(e) => setNewMenu((s) => ({ ...s, name: e.target.value }))}
                      placeholder="Sea King Stew"
                    />
                  </div>
                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Price *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newMenu.price}
                      onChange={(e) => setNewMenu((s) => ({ ...s, price: e.target.value }))}
                      placeholder="18.99"
                    />
                  </div>
                  {/* Origin */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Origin *</label>
                    <select
                      value={newMenu.origin}
                      onChange={(e) => setNewMenu((s) => ({ ...s, origin: e.target.value as MenuItemOrigin }))}
                      className="w-full h-10 border border-border rounded-md px-3 text-sm bg-background"
                    >
                      {ORIGINS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Category *</label>
                    <Input
                      value={newMenu.category}
                      onChange={(e) => setNewMenu((s) => ({ ...s, category: e.target.value }))}
                      placeholder="Stew"
                    />
                  </div>
                  {/* Description */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <Input
                      value={newMenu.description}
                      onChange={(e) => setNewMenu((s) => ({ ...s, description: e.target.value }))}
                      placeholder="A hearty stew from the depths…"
                    />
                  </div>
                  {/* Dish Photo */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Dish Photo</label>
                    <div className="flex items-center gap-3">
                      {newMenu.imageUrl && (
                        <img
                          src={newMenu.imageUrl}
                          alt="preview"
                          className="w-14 h-14 rounded-lg object-cover border border-border"
                        />
                      )}
                      <label
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm cursor-pointer transition-colors ${
                          uploadingImage ? "opacity-50 pointer-events-none" : "hover:bg-muted"
                        }`}
                      >
                        <Plus className="w-4 h-4 text-muted-foreground" />
                        {uploadingImage ? "Uploading…" : newMenu.imageUrl ? "Change photo" : "Upload photo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadImage(f, false);
                          }}
                          disabled={uploadingImage}
                        />
                      </label>
                      {newMenu.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setNewMenu((s) => ({ ...s, imageUrl: "" }))}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Availability & Featured */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newMenu.isAvailable}
                        onChange={(e) => setNewMenu((s) => ({ ...s, isAvailable: e.target.checked }))}
                        className="rounded"
                      />
                      Available
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newMenu.isFeatured}
                        onChange={(e) => setNewMenu((s) => ({ ...s, isFeatured: e.target.checked }))}
                        className="rounded"
                      />
                      Featured
                    </label>
                  </div>
                </div>
                {/* Buttons */}
                <div className="flex gap-2 mt-5">
                  {/* Add Item Button */}
                  <Button
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() =>
                      createMenuItem.mutate({
                        data: {
                          name: newMenu.name,
                          description: newMenu.description || undefined,
                          price: parseFloat(newMenu.price) || 0,
                          origin: newMenu.origin,
                          category: newMenu.category,
                          imageUrl: newMenu.imageUrl || undefined,
                          isAvailable: newMenu.isAvailable,
                          isFeatured: newMenu.isFeatured,
                        },
                      })
                    }
                    disabled={
                      createMenuItem.isPending ||
                      !newMenu.name ||
                      !newMenu.price ||
                      !newMenu.category
                    }
                  >
                    <Check className="w-4 h-4 mr-1" /> Add Item
                  </Button>
                  {/* Cancel Button */}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAddMenu(false);
                      setNewMenu(BLANK_MENU_EDIT);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex justify-end">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2" onClick={() => setShowAddMenu(true)}>
                <Plus className="w-4 h-4" /> Add Menu Item
              </Button>
            </div>
          )}

          {/* Existing Menu Items */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">Menu Items</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMenu ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}</div>
              ) : !menuItems?.length ? (
                <p className="text-muted-foreground text-center py-8">No menu items yet.</p>
              ) : (
                <div className="space-y-3">
                  {menuItems.map((item) => {
                    const isEditing = menuEditState?.id === item.id;
                    const isDeleting = deletingMenuId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="group border border-border/50 rounded-xl overflow-hidden hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex gap-4 p-4">
                          {/* Image thumbnail */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageOff className="w-6 h-6 text-muted-foreground/40" />
                            )}
                          </div>
                          {/* Details / Edit */}
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Name */}
                                <div className="space-y-1">
                                  <label className="text-xs text-muted-foreground">Name</label>
                                  <Input
                                    value={menuEditState?.name}
                                    onChange={(e) => setMenuEditState((s) => (s ? { ...s, name: e.target.value } : s))}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                {/* Price */}
                                <div className="space-y-1">
                                  <label className="text-xs text-muted-foreground">Price</label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={menuEditState?.price}
                                    onChange={(e) => setMenuEditState((s) => (s ? { ...s, price: e.target.value } : s))}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                {/* Origin */}
                                <div className="space-y-1">
                                  <label className="text-xs text-muted-foreground">Origin</label>
                                  <select
                                    value={menuEditState?.origin}
                                    onChange={(e) => setMenuEditState((s) => (s ? { ...s, origin: e.target.value as MenuItemOrigin } : s))}
                                    className="w-full h-8 border border-border rounded-md px-2 text-sm bg-background"
                                  >
                                    {ORIGINS.map((o) => (
                                      <option key={o.value} value={o.value}>
                                        {o.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {/* Category */}
                                <div className="space-y-1">
                                  <label className="text-xs text-muted-foreground">Category</label>
                                  <Input
                                    value={menuEditState?.category}
                                    onChange={(e) => setMenuEditState((s) => (s ? { ...s, category: e.target.value } : s))}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                {/* Description */}
                                <div className="sm:col-span-2 space-y-1">
                                  <label className="text-xs text-muted-foreground">Description</label>
                                  <Input
                                    value={menuEditState?.description}
                                    onChange={(e) => setMenuEditState((s) => (s ? { ...s, description: e.target.value } : s))}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                {/* Dish Photo */}
                                <div className="sm:col-span-2 space-y-1">
                                  <label className="text-xs text-muted-foreground">Dish Photo</label>
                                  <div className="flex items-center gap-3">
                                    {menuEditState?.imageUrl && (
                                      <img
                                        src={menuEditState?.imageUrl}
                                        alt="preview"
                                        className="w-10 h-10 rounded-md object-cover border border-border"
                                      />
                                    )}
                                    <label
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-xs cursor-pointer transition-colors ${
                                        editUploadingImage ? "opacity-50 pointer-events-none" : "hover:bg-muted"
                                      }`}
                                    >
                                      <Plus className="w-3 h-3 text-muted-foreground" />
                                      {editUploadingImage ? "Uploading…" : menuEditState?.imageUrl ? "Change" : "Upload"}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const f = e.target.files?.[0];
                                          if (f) uploadImage(f, true);
                                        }}
                                        disabled={editUploadingImage}
                                      />
                                    </label>
                                    {menuEditState?.imageUrl && (
                                      <button
                                        type="button"
                                        onClick={() => setMenuEditState((s) => (s ? { ...s, imageUrl: "" } : s))}
                                        className="text-xs text-muted-foreground hover:text-destructive"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {/* Availability & Featured */}
                                <div className="flex items-center gap-6">
                                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={menuEditState?.isAvailable}
                                      onChange={(e) =>
                                        setMenuEditState((s) => (s ? { ...s, isAvailable: e.target.checked } : s))
                                      }
                                      className="rounded"
                                    />
                                    Available
                                  </label>
                                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={menuEditState?.isFeatured}
                                      onChange={(e) =>
                                        setMenuEditState((s) => (s ? { ...s, isFeatured: e.target.checked } : s))
                                      }
                                      className="rounded"
                                    />
                                    Featured
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Display mode */}
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-semibold text-foreground">{item.name}</span>
                                    {item.isFeatured && (
                                      <Badge variant="secondary" className="ml-2 text-xs bg-yellow-100 text-yellow-700">
                                        Featured
                                      </Badge>
                                    )}
                                    {!item.isAvailable && (
                                      <Badge variant="secondary" className="ml-2 text-xs bg-red-100 text-red-700">
                                        Unavailable
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="font-semibold text-accent">${item.price.toFixed(2)}</span>
                                </div>
                                {/* Category & origin */}
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {item.category}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {ORIGINS.find((o) => o.value === item.origin)?.label}
                                  </span>
                                </div>
                                {/* Description */}
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                                )}
                              </>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {isDeleting ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Delete?</span>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 px-2"
                                  onClick={() => deleteMenuItem.mutate({ id: item.id })}
                                  disabled={deleteMenuItem.isPending}
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() => setDeletingMenuId(null)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : isEditing ? (
                              <div className="flex items-center gap-1">
                                {/* Save */}
                                <Button
                                  size="sm"
                                  className="h-7 px-3 bg-accent hover:bg-accent/90 text-accent-foreground text-xs"
                                  onClick={() =>
                                    updateMenuItem.mutate({
                                      id: item.id,
                                      data: {
                                        name: menuEditState?.name,
                                        description: menuEditState?.description || undefined,
                                        price: parseFloat(menuEditState?.price || "0") || item.price,
                                        origin: menuEditState?.origin,
                                        category: menuEditState?.category,
                                        imageUrl: menuEditState?.imageUrl || undefined,
                                        isAvailable: menuEditState?.isAvailable,
                                        isFeatured: menuEditState?.isFeatured,
                                      },
                                    })
                                  }
                                  disabled={updateMenuItem.isPending}
                                >
                                  Save
                                </Button>
                                {/* Cancel */}
                                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setMenuEditState(null)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              // Edit & delete buttons
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs gap-1"
                                  onClick={() =>
                                    setMenuEditState({
                                      id: item.id,
                                      name: item.name,
                                      description: item.description ?? "",
                                      price: String(item.price),
                                      origin: item.origin,
                                      category: item.category,
                                      imageUrl: item.imageUrl ?? "",
                                      isAvailable: item.isAvailable ?? true,
                                      isFeatured: item.isFeatured ?? false,
                                    })
                                  }
                                >
                                  <Pencil className="w-3 h-3" /> Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 hover:text-destructive"
                                  onClick={() => setDeletingMenuId(item.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chefs Tab */}
      {tab === "chefs" && (
        <div className="space-y-4">
          {/* Add Chef Form */}
          {showAddChef ? (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="font-serif text-xl text-primary flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-accent" />
                  {editingChefId ? "Edit Chef" : "Add New Chef"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Name *</label>
                    <Input
                      value={editingChefId ? chefEditState?.name ?? "" : newChef.name}
                      onChange={(e) =>
                        editingChefId
                          ? setChefEditState((s) => (s ? { ...s, name: e.target.value } : s))
                          : setNewChef((s) => ({ ...s, name: e.target.value }))
                      }
                      placeholder="Zeff the Pirate Cook"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Specialty *</label>
                    <Input
                      value={editingChefId ? chefEditState?.specialty ?? "" : newChef.specialty}
                      onChange={(e) =>
                        editingChefId
                          ? setChefEditState((s) => (s ? { ...s, specialty: e.target.value } : s))
                          : setNewChef((s) => ({ ...s, specialty: e.target.value }))
                      }
                      placeholder="Seafood & Grand Line Cuisine"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Years of Experience</label>
                    <Input
                      type="number"
                      min={0}
                      value={editingChefId ? chefEditState?.yearsExperience ?? "" : newChef.yearsExperience}
                      onChange={(e) =>
                        editingChefId
                          ? setChefEditState((s) => (s ? { ...s, yearsExperience: e.target.value } : s))
                          : setNewChef((s) => ({ ...s, yearsExperience: e.target.value }))
                      }
                      placeholder="20"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Bio</label>
                    <Input
                      value={editingChefId ? chefEditState?.bio ?? "" : newChef.bio}
                      onChange={(e) =>
                        editingChefId
                          ? setChefEditState((s) => (s ? { ...s, bio: e.target.value } : s))
                          : setNewChef((s) => ({ ...s, bio: e.target.value }))
                      }
                      placeholder="A legendary cook who sailed the seas…"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Chef Photo</label>
                    <div className="flex items-center gap-3">
                      {(editingChefId ? chefEditState?.imageUrl : newChef.imageUrl) && (
                        <img
                          src={editingChefId ? chefEditState?.imageUrl : newChef.imageUrl}
                          alt="preview"
                          className="w-14 h-14 rounded-lg object-cover border border-border"
                        />
                      )}
                      <label
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm cursor-pointer transition-colors ${
                          uploadingImage ? "opacity-50 pointer-events-none" : "hover:bg-muted"
                        }`}
                      >
                        <Plus className="w-4 h-4 text-muted-foreground" />
                        {uploadingImage ? "Uploading…" : "Upload photo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadChefImage(f, !!editingChefId);
                          }}
                          disabled={uploadingImage}
                        />
                      </label>
                      {(editingChefId ? chefEditState?.imageUrl : newChef.imageUrl) && (
                        <button
                          type="button"
                          onClick={() =>
                            editingChefId
                              ? setChefEditState((s) => (s ? { ...s, imageUrl: "" } : s))
                              : setNewChef((s) => ({ ...s, imageUrl: "" }))
                          }
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  {editingChefId ? (
                    <Button
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() =>
                        updateChef.mutate({
                          id: editingChefId,
                          data: {
                            name: chefEditState?.name,
                            specialty: chefEditState?.specialty,
                            bio: chefEditState?.bio || undefined,
                            imageUrl: chefEditState?.imageUrl || undefined,
                            yearsExperience: Number(chefEditState?.yearsExperience) || 0,
                          },
                        })
                      }
                      disabled={updateChef.isPending || !chefEditState?.name || !chefEditState?.specialty}
                    >
                      <Check className="w-4 h-4 mr-1" /> Save Changes
                    </Button>
                  ) : (
                    <Button
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() =>
                        createChef.mutate({
                          data: {
                            name: newChef.name,
                            specialty: newChef.specialty,
                            bio: newChef.bio || undefined,
                            imageUrl: newChef.imageUrl || undefined,
                            yearsExperience: Number(newChef.yearsExperience) || 0,
                          },
                        })
                      }
                      disabled={createChef.isPending || !newChef.name || !newChef.specialty}
                    >
                      <Check className="w-4 h-4 mr-1" /> Add Chef
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAddChef(false);
                      setEditingChefId(null);
                      setChefEditState(null);
                      setNewChef(BLANK_CHEF_EDIT);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex justify-end">
              <Button
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                onClick={() => setShowAddChef(true)}
              >
                <Plus className="w-4 h-4" /> Add Chef
              </Button>
            </div>
          )}

          {/* Existing Chefs */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-primary">Our Chefs</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingChefs ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}</div>
              ) : !chefs?.length ? (
                <p className="text-muted-foreground text-center py-8">No chefs yet. Add one above!</p>
              ) : (
                <div className="space-y-3">
                  {chefs.map((chef) => {
                    const isDeleting = deletingChefId === chef.id;
                    return (
                      <div key={chef.id} className="group border border-border/50 rounded-xl p-4 hover:bg-muted/10 transition-colors">
                        <div className="flex gap-4">
                          {/* Photo */}
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                            {chef.imageUrl ? (
                              <img src={chef.imageUrl} alt={chef.name} className="w-full h-full object-cover" />
                            ) : (
                              <ChefHat className="w-6 h-6 text-muted-foreground/40" />
                            )}
                          </div>
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-semibold text-foreground">{chef.name}</span>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs text-muted-foreground">{chef.specialty}</span>
                                  {chef.yearsExperience != null && chef.yearsExperience > 0 && (
                                    <span className="text-xs text-muted-foreground">• {chef.yearsExperience} yrs exp</span>
                                  )}
                                </div>
                                {chef.bio && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{chef.bio}</p>
                                )}
                              </div>
                              {/* Actions */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {isDeleting ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">Delete?</span>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-7 px-2"
                                      onClick={() => deleteChef.mutate({ id: chef.id })}
                                      disabled={deleteChef.isPending}
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2"
                                      onClick={() => setDeletingChefId(null)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs gap-1"
                                      onClick={() => {
                                        setChefEditState({
                                          id: chef.id,
                                          name: chef.name,
                                          specialty: chef.specialty,
                                          bio: chef.bio ?? "",
                                          imageUrl: chef.imageUrl ?? "",
                                          yearsExperience: String(chef.yearsExperience ?? 0),
                                        });
                                        setEditingChefId(chef.id);
                                        setShowAddChef(true);
                                      }}
                                    >
                                      <Pencil className="w-3 h-3" /> Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2 hover:text-destructive"
                                      onClick={() => setDeletingChefId(chef.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}