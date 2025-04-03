"use server";

import { z } from 'zod'
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Por favor seleccione un cliente.',
    }),
    amount: z.coerce
    .number()
    .gt(0, { message: 'Por favor ingrese una cantidad mayor a $0'}),
    status: z.enum(['pending', 'paid'],{
        invalid_type_error: 'Por favor seleccione un estado de la factura.',
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true});
export type State = {
    errors: {
        customerID?: string[],
        amount?: string[],
        status?: string[],
    };
    message: string;
};

export async function createInvoice(prevState: State, formData: FormData) {
    
    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Campos que faltan. Error al crear la factura.',
      };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error){
      console.error("Error al crear la factura:", error);
      return {
        errors: {},
        message: 'Error de la base de datos: No se pudo crear la factura.',
      };
    }
    
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData){
    const { customerId, amount, status} = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try{
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status= ${status}
            WHERE id = ${id}
        `;
    }catch(error){

        console.error('Error de la Base de Datos: Nose pudo actualizar la factura', error);
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string){
    try{
        await sql`DELETE FROM invoices WHERE ID = ${id}`;
        revalidatePath('/dashboard/invoices');
        //return{message: 'Factura eliminada'};
    }catch(error){
        console.error('Error de la Base de Datos: No se pudo eliminar la factura', error);
    }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales inválidas.';
        default:
          return 'Algo salió mal.';
      }
    }
    throw error;
  }
}