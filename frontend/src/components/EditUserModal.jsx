"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditUserModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <Input placeholder="Name" />
          <Input placeholder="Email" />
          <Input placeholder="Role" />
          <Input
            type="password"
            placeholder="Leave blank to keep existing password"
            className='mt-2'
          />
          <Input placeholder="Address" />
          <Input placeholder="Phone Number" />
        </form>
        <DialogFooter className="mt-4">
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
