import { Home, Inbox, Search, Settings } from "lucide-react";
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

// Menu items.
const items = [
  {
    title: "NADA",
    url: "#",
    icon: FaHome,
  },
  {
    title: "Users",
    url: "#",
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
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>NADA EAuctioning </SidebarGroupLabel>
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
      </SidebarContent>
    </Sidebar>
  );
}
export default AppSidebar;
