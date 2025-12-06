import { getCustomers } from "@/actions/admin";
import { AdminBillsClient } from "@/components/admin-bills-client";

export default async function AdminBillsPage() {
    const customers = await getCustomers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Generate Bills</h1>
                <p className="text-muted-foreground">Calculate and share monthly bills for customers.</p>
            </div>

            <AdminBillsClient customers={customers} />
        </div>
    );
}
