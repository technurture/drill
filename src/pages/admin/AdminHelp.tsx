import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  FileText,
  Image,
  Video,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Save
} from 'lucide-react';
import { 
  useHelpCategories, 
  useHelpArticles, 
  useCreateHelpArticle,
  useUpdateHelpArticle,
  useDeleteHelpArticle 
} from '@/integrations/supabase/hooks/admin';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Simple Rich Text Editor Component
const RichTextEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const applyFormat = (format: string) => {
    const textarea = document.getElementById('help-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      case 'numbered':
        formattedText = `1. ${selectedText}`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat('underline')}
          className="h-8 w-8 p-0"
        >
          <Underline className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat('list')}
          className="h-8 w-8 p-0"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat('numbered')}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat('link')}
          className="h-8 w-8 p-0"
        >
          <Link className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Textarea */}
      <Textarea
        id="help-content"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your help content here... Use markdown formatting for rich text."
        className="min-h-[300px] font-mono text-sm"
      />
    </div>
  );
};

const AdminHelp = () => {
  const { data: categories } = useHelpCategories();
  const { data: articles, isLoading } = useHelpArticles();
  const createArticle = useCreateHelpArticle();
  const updateArticle = useUpdateHelpArticle();
  const deleteArticle = useDeleteHelpArticle();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category_id: '',
    language: 'english' as 'english' | 'yoruba' | 'hausa' | 'igbo' | 'pidgin',
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false,
    media_links: [] as string[],
    notes: '',
    important_sections: [] as any[]
  });

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'yoruba', label: 'Yoruba' },
    { value: 'hausa', label: 'Hausa' },
    { value: 'igbo', label: 'Igbo' },
    { value: 'pidgin', label: 'Pidgin' }
  ];

  const filteredArticles = articles?.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || article.category_id === categoryFilter;
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createArticle.mutateAsync({
        ...formData
      });
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        content: '',
        category_id: '',
        language: 'english',
        status: 'draft',
        featured: false,
        media_links: [],
        notes: '',
        important_sections: []
      });
    } catch (error) {
      console.error('Error creating article:', error);
    }
  };

  const handleUpdateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;
    
    try {
      await updateArticle.mutateAsync({
        id: selectedArticle.id,
        ...formData
      });
      setIsEditModalOpen(false);
      setSelectedArticle(null);
    } catch (error) {
      console.error('Error updating article:', error);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (confirm('Are you sure you want to delete this help article?')) {
      try {
        await deleteArticle.mutateAsync(articleId);
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  const openEditModal = (article: any) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      description: article.description,
      content: article.content,
      category_id: article.category_id,
      language: article.language,
      status: article.status,
      featured: article.featured,
      media_links: article.media_links,
      notes: article.notes,
      important_sections: article.important_sections
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Help Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage help articles for users
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Help Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Help Article</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateArticle} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter article title"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the help article"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Select value={formData.language} onValueChange={(value: any) => setFormData({...formData, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">Featured</label>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Content</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({...formData, content: value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Media Links (one per line)</label>
                <Textarea
                  value={formData.media_links.join('\n')}
                  onChange={(e) => setFormData({...formData, media_links: e.target.value.split('\n').filter(link => link.trim())})}
                  placeholder="Enter image or video URLs, one per line"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes or important information"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={createArticle.isPending}>
                  {createArticle.isPending ? 'Creating...' : 'Create Article'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Help Articles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No help articles found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{article.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {article.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {article.category?.name || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {article.language}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            article.status === 'published' ? 'default' : 
                            article.status === 'draft' ? 'secondary' : 'destructive'
                          }
                        >
                          {article.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>{article.views_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(article.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(article)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteArticle(article.id)}
                            disabled={deleteArticle.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Help Article</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateArticle} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter article title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the help article"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Language</label>
                <Select value={formData.language} onValueChange={(value: any) => setFormData({...formData, language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="edit-featured" className="text-sm font-medium">Featured</label>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Content</label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({...formData, content: value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Media Links (one per line)</label>
              <Textarea
                value={formData.media_links.join('\n')}
                onChange={(e) => setFormData({...formData, media_links: e.target.value.split('\n').filter(link => link.trim())})}
                placeholder="Enter image or video URLs, one per line"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes or important information"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={updateArticle.isPending}>
                {updateArticle.isPending ? 'Updating...' : 'Update Article'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHelp; 