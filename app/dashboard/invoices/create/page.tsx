import Form from "@/app/ui/invoices/create-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Crear Factura',
};

export default async function Page(){
    const customers = await fetchCustomers();

    return(
        <main>
            <Breadcrumbs 
                breadcrumbs={[
                    { label: 'Facturas', href: '/dashboard/invoices' },
                    {
                        label: 'Crear factura',
                        href: '/dashboard/invoices/create',
                        active: true,
                    },
                ]}
            />
            <Form customers={customers} />
        </main>
    );
}