import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting?: boolean;
    itemLabel?: string;
}

export default function DeleteConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    isDeleting = false,
    itemLabel = "item",
}: Readonly<DeleteConfirmDialogProps>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle>Delete {itemLabel}?</DialogTitle>
                            <DialogDescription className="mt-1">
                                Are you sure you want to delete this {itemLabel}? This action cannot be undone.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <DialogFooter className="mt-4">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                        className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition cursor-pointer text-sm disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition cursor-pointer text-sm disabled:opacity-50"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
