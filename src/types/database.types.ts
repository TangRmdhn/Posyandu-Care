export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      anak: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          foto_url: string | null
          id: string
          id_ortu: string
          jenis_kelamin: string
          nama_anak: string
          nik: string
          rt: string
          rw: string
          tempat_lahir: string
          tgl_lahir: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          foto_url?: string | null
          id?: string
          id_ortu: string
          jenis_kelamin: string
          nama_anak: string
          nik: string
          rt: string
          rw: string
          tempat_lahir: string
          tgl_lahir: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          foto_url?: string | null
          id?: string
          id_ortu?: string
          jenis_kelamin?: string
          nama_anak?: string
          nik?: string
          rt?: string
          rw?: string
          tempat_lahir?: string
          tgl_lahir?: string
        }
        Relationships: [
          {
            foreignKeyName: "anak_id_ortu_fkey"
            columns: ["id_ortu"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artikel: {
        Row: {
          created_at: string | null
          created_by: string | null
          gambar_url: string | null
          id: string
          judul: string
          kategori: string | null
          konten: string
          published: boolean
          ringkasan: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          gambar_url?: string | null
          id?: string
          judul: string
          kategori?: string | null
          konten: string
          published?: boolean
          ringkasan?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          gambar_url?: string | null
          id?: string
          judul?: string
          kategori?: string | null
          konten?: string
          published?: boolean
          ringkasan?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string | null
          diff: Json | null
          entity: string
          entity_id: string | null
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string | null
          diff?: Json | null
          entity: string
          entity_id?: string | null
          id?: never
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string | null
          diff?: Json | null
          entity?: string
          entity_id?: string | null
          id?: never
        }
        Relationships: []
      }
      bidan_desa: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nama_bidan: string
          no_hp: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nama_bidan: string
          no_hp?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nama_bidan?: string
          no_hp?: string | null
        }
        Relationships: []
      }
      consent: {
        Row: {
          granted: boolean
          granted_at: string | null
          id: string
          id_anak: string | null
          id_ortu: string
          notice_version: string
        }
        Insert: {
          granted: boolean
          granted_at?: string | null
          id?: string
          id_anak?: string | null
          id_ortu: string
          notice_version: string
        }
        Update: {
          granted?: boolean
          granted_at?: string | null
          id?: string
          id_anak?: string | null
          id_ortu?: string
          notice_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_id_anak_fkey"
            columns: ["id_anak"]
            isOneToOne: false
            referencedRelation: "anak"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_id_ortu_fkey"
            columns: ["id_ortu"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      imunisasi_anak: {
        Row: {
          batch_lot: string | null
          catatan: string | null
          created_at: string | null
          id: string
          id_anak: string
          id_jenis: string
          id_pemberi: string | null
          tgl_pemberian: string
        }
        Insert: {
          batch_lot?: string | null
          catatan?: string | null
          created_at?: string | null
          id?: string
          id_anak: string
          id_jenis: string
          id_pemberi?: string | null
          tgl_pemberian: string
        }
        Update: {
          batch_lot?: string | null
          catatan?: string | null
          created_at?: string | null
          id?: string
          id_anak?: string
          id_jenis?: string
          id_pemberi?: string | null
          tgl_pemberian?: string
        }
        Relationships: [
          {
            foreignKeyName: "imunisasi_anak_id_anak_fkey"
            columns: ["id_anak"]
            isOneToOne: false
            referencedRelation: "anak"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imunisasi_anak_id_jenis_fkey"
            columns: ["id_jenis"]
            isOneToOne: false
            referencedRelation: "imunisasi_jenis"
            referencedColumns: ["id"]
          },
        ]
      }
      imunisasi_jenis: {
        Row: {
          aktif: boolean
          created_at: string | null
          dosis_ke: number
          id: string
          interval_hari_min: number | null
          kode: string
          nama: string
          urutan: number
          usia_bulan_min: number
          usia_bulan_rekomendasi: number
        }
        Insert: {
          aktif?: boolean
          created_at?: string | null
          dosis_ke?: number
          id?: string
          interval_hari_min?: number | null
          kode: string
          nama: string
          urutan: number
          usia_bulan_min: number
          usia_bulan_rekomendasi: number
        }
        Update: {
          aktif?: boolean
          created_at?: string | null
          dosis_ke?: number
          id?: string
          interval_hari_min?: number | null
          kode?: string
          nama?: string
          urutan?: number
          usia_bulan_min?: number
          usia_bulan_rekomendasi?: number
        }
        Relationships: []
      }
      jadwal: {
        Row: {
          catatan: string | null
          created_at: string | null
          created_by: string | null
          id: string
          jam: string
          kuota: number
          kuota_terisi: number
          lokasi: string
          status: string
          tgl_pelaksanaan: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          jam: string
          kuota?: number
          kuota_terisi?: number
          lokasi: string
          status?: string
          tgl_pelaksanaan: string
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          jam?: string
          kuota?: number
          kuota_terisi?: number
          lokasi?: string
          status?: string
          tgl_pelaksanaan?: string
        }
        Relationships: []
      }
      kader: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nama_kader: string
          no_hp: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nama_kader: string
          no_hp?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nama_kader?: string
          no_hp?: string | null
        }
        Relationships: []
      }
      laporan: {
        Row: {
          generated_by: string | null
          id: string
          id_jadwal: string | null
          summary_json: Json | null
          tgl_generasi: string | null
        }
        Insert: {
          generated_by?: string | null
          id?: string
          id_jadwal?: string | null
          summary_json?: Json | null
          tgl_generasi?: string | null
        }
        Update: {
          generated_by?: string | null
          id?: string
          id_jadwal?: string | null
          summary_json?: Json | null
          tgl_generasi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "laporan_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "bidan_desa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laporan_id_jadwal_fkey"
            columns: ["id_jadwal"]
            isOneToOne: false
            referencedRelation: "jadwal"
            referencedColumns: ["id"]
          },
        ]
      }
      pemeriksaan: {
        Row: {
          berat_badan: number | null
          created_at: string | null
          id: string
          id_anak: string
          id_bidan: string | null
          id_kader: string | null
          id_reservasi: string | null
          is_validated: boolean | null
          lingkar_kepala: number | null
          lingkar_lengan_atas: number | null
          pemberian_bantuan_medis: string | null
          saran_medis: string | null
          status_bb_tb: string | null
          status_bb_u: string | null
          status_gizi: string | null
          status_tb_u: string | null
          tgl_pemeriksaan: string
          tinggi_badan: number | null
          ukuran_panjang_telentang: boolean | null
          updated_at: string | null
          updated_by: string | null
          validated_at: string | null
          zscore_bb_tb: number | null
          zscore_bb_u: number | null
          zscore_tb_u: number | null
        }
        Insert: {
          berat_badan?: number | null
          created_at?: string | null
          id?: string
          id_anak: string
          id_bidan?: string | null
          id_kader?: string | null
          id_reservasi?: string | null
          is_validated?: boolean | null
          lingkar_kepala?: number | null
          lingkar_lengan_atas?: number | null
          pemberian_bantuan_medis?: string | null
          saran_medis?: string | null
          status_bb_tb?: string | null
          status_bb_u?: string | null
          status_gizi?: string | null
          status_tb_u?: string | null
          tgl_pemeriksaan?: string
          tinggi_badan?: number | null
          ukuran_panjang_telentang?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          validated_at?: string | null
          zscore_bb_tb?: number | null
          zscore_bb_u?: number | null
          zscore_tb_u?: number | null
        }
        Update: {
          berat_badan?: number | null
          created_at?: string | null
          id?: string
          id_anak?: string
          id_bidan?: string | null
          id_kader?: string | null
          id_reservasi?: string | null
          is_validated?: boolean | null
          lingkar_kepala?: number | null
          lingkar_lengan_atas?: number | null
          pemberian_bantuan_medis?: string | null
          saran_medis?: string | null
          status_bb_tb?: string | null
          status_bb_u?: string | null
          status_gizi?: string | null
          status_tb_u?: string | null
          tgl_pemeriksaan?: string
          tinggi_badan?: number | null
          ukuran_panjang_telentang?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          validated_at?: string | null
          zscore_bb_tb?: number | null
          zscore_bb_u?: number | null
          zscore_tb_u?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pemeriksaan_id_anak_fkey"
            columns: ["id_anak"]
            isOneToOne: false
            referencedRelation: "anak"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pemeriksaan_id_bidan_fkey"
            columns: ["id_bidan"]
            isOneToOne: false
            referencedRelation: "bidan_desa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pemeriksaan_id_kader_fkey"
            columns: ["id_kader"]
            isOneToOne: false
            referencedRelation: "kader"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pemeriksaan_id_reservasi_fkey"
            columns: ["id_reservasi"]
            isOneToOne: false
            referencedRelation: "reservasi"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nama: string
          no_hp: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nama: string
          no_hp?: string | null
          role: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nama?: string
          no_hp?: string | null
          role?: string
        }
        Relationships: []
      }
      reservasi: {
        Row: {
          created_at: string | null
          id: string
          id_anak: string
          id_jadwal: string
          id_ortu: string
          no_antrean: number | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_anak: string
          id_jadwal: string
          id_ortu: string
          no_antrean?: number | null
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          id_anak?: string
          id_jadwal?: string
          id_ortu?: string
          no_antrean?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservasi_id_anak_fkey"
            columns: ["id_anak"]
            isOneToOne: false
            referencedRelation: "anak"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservasi_id_jadwal_fkey"
            columns: ["id_jadwal"]
            isOneToOne: false
            referencedRelation: "jadwal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservasi_id_ortu_fkey"
            columns: ["id_ortu"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
