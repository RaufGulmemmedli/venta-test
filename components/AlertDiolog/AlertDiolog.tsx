import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface AlertDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const AlertDialogComponent: React.FC<AlertDialogProps> = ({ open, setOpen, title, description, onConfirm, onCancel }) => {
    const t = useTranslations("AlertDialog");

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button variant="outline" onClick={onCancel}>{t("cancel")}</Button>
                    <Button variant="default" onClick={onConfirm}>{t("confirm")}</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default AlertDialogComponent;