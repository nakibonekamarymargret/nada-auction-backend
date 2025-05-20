import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";

const BidResultModal = ({
  isOpen, // control open state from parent
  onOpenChange, // callback to close/open modal
  bidApiMessage, // The message from the backend API (e.g., "Congratulations..." or "Sorry...")
  bidApiWinningAmount, // The winning amount from the backend API
  bidApiCheckoutUrl, // The checkout URL from the backend API (if user won)
}) => {
  // Check if the user won the bid based on the message
  const userWon = bidApiMessage.includes("Congratulations, you are the winner");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bid Results</DialogTitle>
          <DialogDescription>
            Thank you for choosing Nada, please view the auction results.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 space-y-2">
          {bidApiMessage ? ( // Check if the message is available)
            <>
              <p>
                {userWon ? "🎉 " : ""}
                {bidApiMessage}
              </p>
              {userWon && bidApiWinningAmount !== null && (
                <p>
                  Winning Bid Amount:{" "}
                  <strong>${bidApiWinningAmount.toFixed(2)}</strong>
                </p>
              )}
              {userWon && bidApiCheckoutUrl && (
                <Button
                  onClick={() => {
                    window.location.href = bidApiCheckoutUrl;
                  }}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white"
                >
                  Continue to Pay
                </Button>
              )}
            </>
          ) : (
            // Display a loading message while waiting for the API response
            <p>Loading bid results...</p>
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
