import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../../components/ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";

const BidResultModal = ({
  isOpen, // control open state from parent
  onOpenChange, // callback to close/open modal
  isWinner, // boolean: did user win?
  winningBidAmount, // number/string: winning bid price
  onPay, // callback when clicking "Continue to Pay"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Optional: you can remove trigger if controlled externally */}
      {/* <DialogTrigger><Button variant="outline" size="sm">Bid Result</Button></DialogTrigger> */}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bid Results</DialogTitle>
          <DialogDescription>
            Thank you for choosing Nada, please view the auction results
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          {isWinner ? (
            <>
              <p>🎉 Congratulations! You have won the auction.</p>
              <p>
                Winning Bid Amount: <strong>${winningBidAmount}</strong>
              </p>
              <Button onClick={onPay}>Continue to Pay</Button>
            </>
          ) : (
            <p>Sorry, you did not win this auction. Better luck next time!</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BidResultModal;
