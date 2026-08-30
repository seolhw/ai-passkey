import { createStore } from "@tanstack/react-store";

/** 全局登录/注册弹窗开关 */
export const authDialogOpen = createStore(false);

export const openAuthDialog = () => authDialogOpen.setState(() => true);

export const closeAuthDialog = () => authDialogOpen.setState(() => false);
