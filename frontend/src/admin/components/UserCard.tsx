import React from 'react';
import { type User } from '../../services/adminService';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { format } from 'date-fns';
import { Mail, Phone, Calendar, User as UserIcon, Shield, Check, X } from 'lucide-react';

type ExtendedUser = User & {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'event_manager' | 'admin';
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
  profileImage?: string;
  phone?: string;
  lastLogin?: string;
  eventsManaged?: number;
  eventsAttended?: number;
};

interface UserCardProps {
  user: ExtendedUser;
  onStatusChange: (userId: string, status: 'active' | 'blocked') => void;
  onDelete: (userId: string) => void;
}

const statusVariant = {
  active: 'bg-green-100 text-green-800 hover:bg-green-100',
  blocked: 'bg-red-100 text-red-800 hover:bg-red-100',
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
};

const roleVariant = {
  user: 'bg-blue-100 text-blue-800',
  event_manager: 'bg-purple-100 text-purple-800',
  admin: 'bg-amber-100 text-amber-800',
};

export const UserCard: React.FC<UserCardProps> = ({ user, onStatusChange, onDelete }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="bg-gray-50 p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
            <AvatarImage src={user.profileImage} alt={user.name} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {user.name}
              <Badge className={`ml-2 text-xs ${roleVariant[user.role as keyof typeof roleVariant] || 'bg-gray-100 text-gray-800'}`}>
                {user.role === 'event_manager' ? 'Event Manager' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </CardTitle>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Mail className="h-4 w-4 mr-1" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Phone className="h-4 w-4 mr-1" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
          <Badge 
            className={`px-2 py-1 text-xs font-medium rounded-full ${statusVariant[user.status as keyof typeof statusVariant] || 'bg-gray-100 text-gray-800'}`}
          >
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-gray-500">Member Since</p>
            <p className="font-medium">
              {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500">Last Active</p>
            <p className="font-medium">
              {user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy') : 'N/A'}
            </p>
          </div>
          {user.eventsManaged && user.eventsManaged > 0 && (
            <div className="space-y-1">
              <p className="text-gray-500">Events Managed</p>
              <p className="font-medium">{user.eventsManaged}</p>
            </div>
          )}
          {user.eventsAttended && user.eventsAttended > 0 && (
            <div className="space-y-1">
              <p className="text-gray-500">Events Attended</p>
              <p className="font-medium">{user.eventsAttended}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 border-t flex justify-end space-x-2">
        {user.status === 'active' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(user._id, 'blocked')}
            className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
          >
            <X className="h-4 w-4 mr-1" />
            Block
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(user._id, 'active')}
            className="text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300"
          >
            <Check className="h-4 w-4 mr-1" />
            Activate
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(user._id)}
          className="text-gray-600 hover:bg-gray-50 border-gray-200 hover:border-gray-300"
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserCard;
