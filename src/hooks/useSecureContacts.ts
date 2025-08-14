import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { ContactEntity } from '@/types/lead';

interface SecureContactData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  business_name?: string;
  location?: string;
  stage?: string;
  priority?: string;
  loan_type?: string;
  loan_amount?: number;
  credit_score?: number;
  income?: number;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export const useSecureContacts = () => {
  const [contacts, setContacts] = useState<SecureContactData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSecureContacts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // First get the contact IDs that belong to the user
      const { data: contactIds, error: idsError } = await supabase
        .from('contact_entities')
        .select('id')
        .eq('user_id', user.id);

      if (idsError) throw idsError;

      if (!contactIds?.length) {
        setContacts([]);
        return;
      }

      // Then fetch masked data for each contact using the secure function
      const secureContacts: SecureContactData[] = [];
      
      for (const { id } of contactIds) {
        const { data, error } = await supabase.rpc('get_masked_contact_data_enhanced', {
          p_contact_id: id,
          p_requesting_user_id: user.id
        });

        if (error) {
          console.error('Error fetching contact:', error);
          continue;
        }

        if (data) {
          secureContacts.push(data as unknown as SecureContactData);
        }
      }

      setContacts(secureContacts);
    } catch (error) {
      console.error('Error fetching secure contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts securely",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSecureContact = async (contactData: Partial<ContactEntity>) => {
    if (!user) return null;

    try {
      // Separate sensitive fields
      const sensitiveFields = {
        email: contactData.email,
        phone: contactData.phone,
        credit_score: contactData.credit_score?.toString(),
        income: contactData.income?.toString(),
        loan_amount: contactData.loan_amount?.toString()
      };

      // Non-sensitive fields for main table
      const mainFields = {
        name: contactData.name || '',
        email: '', // Will be encrypted separately
        business_name: contactData.business_name,
        location: contactData.location,
        stage: contactData.stage,
        priority: contactData.priority,
        loan_type: contactData.loan_type,
        notes: contactData.notes,
        user_id: user.id
      };

      // Create contact in main table first
      const { data: newContact, error: createError } = await supabase
        .from('contact_entities')
        .insert(mainFields)
        .select()
        .single();

      if (createError) throw createError;

      // Encrypt sensitive fields using enhanced function
      for (const [fieldName, fieldValue] of Object.entries(sensitiveFields)) {
        if (fieldValue && fieldValue.trim()) {
          const { error: encryptError } = await supabase.rpc('encrypt_contact_field_enhanced', {
            p_contact_id: newContact.id,
            p_field_name: fieldName,
            p_field_value: fieldValue.trim()
          });

          if (encryptError) {
            console.error(`Error encrypting ${fieldName}:`, encryptError);
          }
        }
      }

      await fetchSecureContacts();
      
      toast({
        title: "Success",
        description: "Contact created securely"
      });

      return newContact;
    } catch (error) {
      console.error('Error creating secure contact:', error);
      toast({
        title: "Error",
        description: "Failed to create contact",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateSecureContact = async (contactId: string, updates: Partial<ContactEntity>) => {
    if (!user) return null;

    try {
      // Separate sensitive and non-sensitive fields
      const sensitiveFields = {
        email: updates.email,
        phone: updates.phone,
        credit_score: updates.credit_score?.toString(),
        income: updates.income?.toString(),
        loan_amount: updates.loan_amount?.toString()
      };

      const nonSensitiveFields = {
        name: updates.name,
        business_name: updates.business_name,
        location: updates.location,
        stage: updates.stage,
        priority: updates.priority,
        loan_type: updates.loan_type,
        notes: updates.notes
      };

      // Update using secure function (if it exists) or manually
      const { data: updatedContact, error: updateError } = await supabase
        .from('contact_entities')
        .update(nonSensitiveFields)
        .eq('id', contactId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update encrypted sensitive fields using enhanced function
      for (const [fieldName, fieldValue] of Object.entries(sensitiveFields)) {
        if (fieldValue && fieldValue.trim()) {
          const { error: encryptError } = await supabase.rpc('encrypt_contact_field_enhanced', {
            p_contact_id: contactId,
            p_field_name: fieldName,
            p_field_value: fieldValue.trim()
          });

          if (encryptError) {
            console.error(`Error encrypting ${fieldName}:`, encryptError);
          }
        }
      }

      await fetchSecureContacts();
      
      toast({
        title: "Success",
        description: "Contact updated securely"
      });

      return updatedContact;
    } catch (error) {
      console.error('Error updating secure contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteSecureContact = async (contactId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('contact_entities')
        .delete()
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSecureContacts();
      
      toast({
        title: "Success",
        description: "Contact deleted securely"
      });

      return true;
    } catch (error) {
      console.error('Error deleting secure contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchSecureContacts();
    }
  }, [user]);

  return {
    contacts,
    isLoading,
    fetchSecureContacts,
    createSecureContact,
    updateSecureContact,
    deleteSecureContact
  };
};