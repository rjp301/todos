import PageHeader from "@/components/page-header";
import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useMutations from "@/hooks/use-mutations";

const schema = z.object({
  name: z.string().min(3).max(50),
});

type Schema = z.infer<typeof schema>;

const ListCreate: React.FC = () => {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  });
  const { createList } = useMutations();

  return (
    <div className="grid gap-5 px-3">
      <PageHeader title="Create list" backLink="/" />
      <Form {...form}>
        <form
          className="grid items-start gap-4"
          onSubmit={form.handleSubmit((data) => {
            createList.mutate({ name: data.name });
          })}
        >
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Name</FormLabel>
                <FormControl>
                  <Input autoFocus placeholder="List name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="flex-1">
            <i className="fa-solid fa-plus mr-2" />
            <span>Create list</span>
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ListCreate;
