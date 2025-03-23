import { fetchFilteredCustomers, fetchInvoicesPages } from "@/app/lib/data";
import Table from "@/app/ui/customers/table";
import { lusitana } from "@/app/ui/fonts";
import Pagination from "@/app/ui/invoices/pagination";
import Search from "@/app/ui/search";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Clientes',
};




export default async function Page(props: {
    searchParams?: Promise<{
       query?: string;
       page?: string; 
    }>;
}){
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const customers = await fetchFilteredCustomers(query);
    const totalPages = await fetchInvoicesPages(query);
    return(
        <>
            <Table customers={customers} />
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </>
    );
}