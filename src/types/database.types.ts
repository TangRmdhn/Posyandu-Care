export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      anak: {
        Row: {
          created_at: string | null
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
      jadwal: {
        Row: {
          created_at: string | null
          id: string
          jam: string
          kuota: number
          kuota_terisi: number
          lokasi: string
          tgl_pelaksanaan: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          jam: string
          kuota?: number
          kuota_terisi?: number
          lokasi: string
          tgl_pelaksanaan: string
        }
        Update: {
          created_at?: string | null
          id?: string
          jam?: string
          kuota?: number
          kuota_terisi?: number
          lokasi?: string
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
          status_gizi: string | null
          tgl_pemeriksaan: string
          tinggi_badan: number | null
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
          status_gizi?: string | null
          tgl_pemeriksaan?: string
          tinggi_badan?: number | null
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
          status_gizi?: string | null
          tgl_pemeriksaan?: string
          tinggi_badan?: number | null
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
