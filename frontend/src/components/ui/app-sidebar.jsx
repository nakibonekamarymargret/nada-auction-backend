import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Make sure react-router is set up
import { Home, Inbox, Search, Settings, LogIn, LogOut } from "lucide-react";
import { RiAuctionFill } from "react-icons/ri";
import {
  FaUsers,
  FaHome,
  FaProductHunt,
  FaHandHoldingUsd,
} from "react-icons/fa";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "NADA",
    url: "/",
    icon: FaHome,
  },
  {
    title: "Users",
    url: "/users",
    icon: FaUsers,
  },
  {
    title: "Auctions",
    url: "#",
    icon: RiAuctionFill,
  },
  {
    title: "Products",
    url: "#",
    icon: FaProductHunt,
  },
  {
    title: "Bid",
    url: "#",
    icon: FaHandHoldingUsd,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

function AppSidebar() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();

  const handleAuthToggle = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false); // Log out and stay on dashboard
    } else {
      navigate("/login"); // Redirect to login page
    }
  };

  return (
    <Sidebar className="flex flex-col h-full justify-between">
      <SidebarContent className="flex flex-col h-full justify-between">
        <div>
          <SidebarGroup>
            <SidebarGroupLabel>NADA EAuctioning</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer login/logout */}
        <div className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button
                  onClick={handleAuthToggle}
                  className="flex items-center gap-2"
                >
                  {isLoggedIn ? <LogOut /> : <LogIn />}
                  <span>{isLoggedIn ? "Logout" : "Login"}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
